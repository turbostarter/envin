import {
  ensureSynchronous,
  getDefault,
  getDefaultDictionary,
  isStandardSchema,
  parseWithDictionary,
  type StandardSchemaDictionary,
} from "./standard";
import type {
  ClientFormat,
  DefineEnv,
  EnvOptions,
  ExtendsFormat,
  FinalSchema,
  PrefixFormat,
  Schema,
  ServerFormat,
  SharedFormat,
  ValidationOptions,
} from "./types";

const ignoreProp = (prop: string) => {
  return ["__esModule", "$$typeof"].includes(prop);
};

const getCombinedSchema = <
  Prefix extends PrefixFormat,
  Shared extends SharedFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
>(
  options: ValidationOptions<Prefix, Shared, Server, Client>,
  isServer: boolean,
): StandardSchemaDictionary => {
  return {
    ...(options.shared && options.shared),
    ...(options.server && isServer && options.server),
    ...(options.client && options.client),
  };
};

const getFinalSchema = <
  Prefix extends PrefixFormat,
  Shared extends SharedFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
  Extends extends ExtendsFormat,
  FinalSchema extends Schema,
>(
  options: EnvOptions<Prefix, Shared, Server, Client, Extends, FinalSchema>,
  isServer: boolean,
): StandardSchemaDictionary => {
  const getPresetSchemaRecursive = <
    P extends PrefixFormat,
    Sh extends SharedFormat,
    Se extends ServerFormat,
    Cl extends ClientFormat,
    Ex extends ExtendsFormat,
  >(
    preset: ValidationOptions<P, Sh, Se, Cl> & { extends?: Ex },
  ): StandardSchemaDictionary => {
    const nested = preset.extends?.reduce((acc, nestedPreset) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: necessary for merging preset schemas
        ...acc,
        ...getPresetSchemaRecursive(nestedPreset),
      };
    }, {} as StandardSchemaDictionary);

    return {
      ...(nested ?? {}),
      ...getCombinedSchema(preset, isServer),
    } as StandardSchemaDictionary;
  };

  const presets = (options.extends?.reduce((acc, preset) => {
    return {
      // biome-ignore lint/performance/noAccumulatingSpread: necessary for merging preset schemas
      ...acc,
      ...getPresetSchemaRecursive(preset),
    };
  }, {} as StandardSchemaDictionary) ?? {}) as StandardSchemaDictionary;

  return {
    ...presets,
    ...getCombinedSchema(options, isServer),
  };
};

class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

export function defineEnv<
  Prefix extends PrefixFormat,
  Shared extends SharedFormat = NonNullable<unknown>,
  Server extends ServerFormat = NonNullable<unknown>,
  Client extends ClientFormat = NonNullable<unknown>,
  const Extends extends ExtendsFormat = [],
  FinalSchemaType extends Schema = FinalSchema<Shared, Server, Client, Extends>,
>(
  options: EnvOptions<Prefix, Shared, Server, Client, Extends, FinalSchemaType>,
): DefineEnv<FinalSchemaType> {
  const values = options.envStrict ?? options.env ?? process.env;

  for (const [key, value] of Object.entries(values)) {
    if (value === "") {
      delete values[key];
    }
  }

  const isServer =
    options.isServer ?? (typeof window === "undefined" || "Deno" in window);

  const onError =
    options.onError ??
    ((issues) => {
      console.error("❌ Invalid environment variables:", issues);
      throw new EnvError("Invalid environment variables");
    });

  const onInvalidAccess =
    options.onInvalidAccess ??
    ((variable) => {
      throw new EnvError(
        `❌ Attempted to access a server-side environment variable on the client: ${variable}`,
      );
    });

  const skip = !!options.skip;
  const schema = getFinalSchema(options, isServer);
  const finalSchema = options.transform?.(schema as never, isServer) ?? schema;

  const defaultValues = isStandardSchema(finalSchema)
    ? getDefault(finalSchema)
    : getDefaultDictionary(finalSchema);

  if (skip) {
    return {
      ...defaultValues,
      ...values,
      _schema: schema,
      // biome-ignore lint/suspicious/noExplicitAny: we set the type explicitly
    } as any;
  }

  const parsed = isStandardSchema(finalSchema)
    ? finalSchema["~standard"].validate(values)
    : parseWithDictionary(schema, values);

  ensureSynchronous(parsed, "Validation must be synchronous!");

  if (parsed.issues) {
    return onError(parsed.issues);
  }

  const isServerAccess = (prop: string) => {
    const collectClientDescriptors = (
      preset: ValidationOptions<Prefix, Shared, Server, Client> & {
        extends?: Extends;
      },
    ): Array<{ keys: string[]; prefix: PrefixFormat }> => {
      const current = {
        keys: Object.keys(preset.client ?? {}),
        prefix: preset.clientPrefix,
      };
      const nested = (preset.extends ?? []).flatMap((p) =>
        collectClientDescriptors(p as never),
      );
      return [current, ...nested];
    };

    const collectSharedKeys = (
      preset: ValidationOptions<Prefix, Shared, Server, Client> & {
        extends?: Extends;
      },
    ): string[] => {
      const current = Object.keys(preset.shared ?? {});
      const nested = (preset.extends ?? []).flatMap((p) =>
        collectSharedKeys(p as never),
      );
      return [...current, ...nested];
    };

    const isClientAccess = collectClientDescriptors(options).some(
      (preset) =>
        preset.keys.includes(prop) &&
        (!preset.prefix || prop.startsWith(preset.prefix)),
    );

    const isSharedAccess = collectSharedKeys(options).includes(prop);

    return !isSharedAccess && !isClientAccess;
  };
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop);
  };

  const env = new Proxy("value" in parsed ? parsed.value : {}, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreProp(prop)) return undefined;
      if (prop === "_schema") return schema;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: we set the type explicitly
  return env as any;
}
