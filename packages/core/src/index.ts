import { ZodObject, z } from "zod";

import { getDefaults } from "./defaults";
import type {
  DefineEnv,
  EnvOptions,
  FinalSchema,
  TClientFormat,
  TExtendsFormat,
  TPrefixFormat,
  TSchema,
  TServerFormat,
  TSharedFormat,
} from "./types";

const ignoreProp = (prop: string) => {
  return ["__esModule", "$$typeof", "_def", "_schema"].includes(prop);
};

const mergeSchemas = (schemas: TSchema[]) =>
  schemas.reduce((acc, schema) => {
    return acc instanceof ZodObject && schema instanceof ZodObject
      ? acc.merge(schema)
      : acc?.and(schema);
  }, schemas[0]) ?? z.object({});

const parse = (schema: TSchema, values: unknown) => {
  return schema.safeParse(values);
};

const getSchema = <
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
>(
  options: EnvOptions<TPrefix, TShared, TServer, TClient, TExtends>,
  isServer: boolean
) => {
  const presets =
    options.extends?.map(ext =>
      mergeSchemas([
        ...(ext.shared ? [ext.shared] : []),
        ...(ext.server && isServer ? [ext.server] : []),
        ...(ext.client ? [ext.client] : []),
      ])
    ) ?? [];

  return mergeSchemas([
    ...presets,
    ...(options.shared ? [options.shared] : []),
    ...(options.server && isServer ? [options.server] : []),
    ...(options.client ? [options.client] : []),
  ]);
};

const getKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
  if (schema === null || schema === undefined) return [];
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
    return getKeys(schema.unwrap());
  if (schema instanceof z.ZodArray) return getKeys(schema.element);
  if (schema instanceof z.ZodObject) {
    const entries = Object.entries(schema.shape);
    return entries.flatMap(([key, value]) => {
      const nested =
        value instanceof z.ZodType
          ? getKeys(value).map(subKey => `${key}.${subKey}`)
          : [];
      return nested.length ? nested : key;
    });
  }
  return [];
};

class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

export function defineEnv<
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  const TExtends extends TExtendsFormat = [],
>(
  options: EnvOptions<TPrefix, TShared, TServer, TClient, TExtends>
): DefineEnv<TShared, TServer, TClient, TExtends> & {
  _def: EnvOptions<TPrefix, TShared, TServer, TClient, TExtends>;
  _schema: FinalSchema<TShared, TServer, TClient, TExtends>;
} {
  const values = options.env ?? process.env;

  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      delete values[key];
    }
  }

  const isServer =
    options.isServer ?? (typeof window === "undefined" || "Deno" in window);

  const onError =
    options.onError ??
    (issues => {
      console.error(
        "❌ Invalid environment variables:",
        issues.flatten().fieldErrors
      );
      throw new EnvError("Invalid environment variables");
    });

  const onInvalidAccess =
    options.onInvalidAccess ??
    (variable => {
      throw new EnvError(
        `❌ Attempted to access a server-side environment variable on the client: ${variable}`
      );
    });

  const skip = !!options.skip;

  const schema = getSchema(options, isServer);

  if (skip)
    return {
      ...values,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      ...getDefaults(schema as any),
      _def: options,
      _schema: schema,
    };

  const parsed = parse(schema, values);

  if (parsed.error) {
    onError(parsed.error);
  }

  const isServerAccess = (prop: string) => {
    const isClientAccess = [options, ...(options.extends ?? [])]
      .map(preset => ({
        keys: preset.client ? getKeys(preset.client) : [],
        prefix: preset.clientPrefix,
      }))
      .some(
        preset =>
          preset.keys.includes(prop) &&
          (!preset.prefix || prop.startsWith(preset.prefix))
      );

    const isSharedAccess = [
      ...(options.shared ? getKeys(options.shared) : []),
      ...(options.extends?.flatMap(ext =>
        ext.shared ? getKeys(ext.shared) : []
      ) ?? []),
    ].includes(prop);

    return !isSharedAccess && !isClientAccess;
  };
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop);
  };

  const env = new Proxy(parsed.data ?? {}, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreProp(prop)) return undefined;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
  });

  return {
    ...env,
    _def: options,
    _schema: schema,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } as any;
}
