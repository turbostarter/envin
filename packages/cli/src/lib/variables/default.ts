import * as z from "zod";
import type { StandardSchemaV1 } from "@/lib/standard";

const zodSchema = z.object({
  _def: z.object({
    defaultValue: z.unknown().optional(),
  }),
});

const valibotSchema = z.object({
  default: z.unknown().optional(),
});

const defaultValueSchema = z.union([zodSchema, valibotSchema]);

export const getDefault = (schema: StandardSchemaV1) => {
  const result = defaultValueSchema.safeParse(schema);

  if (!result.success) {
    return undefined;
  }

  if ("default" in result.data) {
    return result.data.default as string | undefined;
  }

  if ("_def" in result.data) {
    if (typeof result.data._def.defaultValue === "function") {
      return result.data._def.defaultValue?.() as string | undefined;
    }
    return result.data._def.defaultValue as string | undefined;
  }

  return undefined;
};
