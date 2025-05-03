import clone from "just-clone";
import type { z } from "zod";

export function getDefaults<T extends z.ZodFirstPartySchemaTypes>(
  schema: T,
): z.output<T> {
  const def = schema._def;
  if (
    !("coerce" in def && def.coerce) &&
    schema.isNullable() &&
    def.typeName !== "ZodDefault"
  ) {
    return null;
  }

  switch (def.typeName) {
    case "ZodObject": {
      const outputObject: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(def.shape())) {
        outputObject[key] = getDefaults(value as z.ZodFirstPartySchemaTypes);
      }
      return outputObject;
    }
    case "ZodRecord":
      return {};
    case "ZodString": {
      if (def.checks) {
        for (const check of def.checks) {
          if (check.kind === "uuid") {
            return crypto.randomUUID();
          }
        }
      }
      return undefined;
    }
    case "ZodNumber":
      for (const check of def.checks || []) {
        if (check.kind === "max" || check.kind === "min") {
          return check.value;
        }
      }
      return undefined;
    case "ZodBigInt":
      return BigInt(0);
    case "ZodBoolean":
      return false;
    case "ZodDate":
      return new Date();
    case "ZodLiteral":
      return def.value;
    case "ZodEffects":
      return getDefaults(def.schema);
    case "ZodArray":
      return [];
    case "ZodTuple":
      return def.items.map((item: z.ZodTypeAny) => getDefaults(item));
    case "ZodSet":
      return new Set();
    case "ZodMap":
      return new Map();
    case "ZodEnum":
      return def.values[0];
    case "ZodNativeEnum":
      // ref. https://github.com/colinhacks/zod/blob/6fe152f98a434a087c0f1ecbce5c52427bd816d3/src/helpers/util.ts#L28-L43
      return Object.values(def.values).filter(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        (value) => typeof def.values[value as any] !== "number",
      )[0];
    case "ZodUnion":
      return getDefaults(def.options[0]);
    case "ZodDiscriminatedUnion":
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return getDefaults(Array.from(def.options.values() as any[])[0]);
    case "ZodIntersection":
      return Object.assign(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        getDefaults(def.left) as any,
        getDefaults(def.right),
      );
    case "ZodFunction":
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return (..._: any[]) => getDefaults(def.returns);
    case "ZodLazy":
      return getDefaults(def.getter());
    case "ZodPipeline":
      return getDefaults(def.in);
    case "ZodDefault":
      return def.innerType._def.typeName === "ZodFunction"
        ? def.defaultValue()
        : clone(def.defaultValue());
    case "ZodNaN":
      return Number.NaN;
    case "ZodNull":
    case "ZodAny":
      return null;
    case "ZodOptional":
      return getDefaults(def.innerType);
    // case "ZodUndefined":
    // case "ZodVoid":
    // case "ZodUnknown":
    // case "ZodNever":
    default:
      return undefined;
  }
}

/*
- required
- client / server / shared
- valid / invalid
- set / unset
*/
