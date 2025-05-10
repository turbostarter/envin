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
  ValidationOptions,
} from "./types";
import { ensureSynchronous, parseWithDictionary } from "./standard";

const ignoreProp = (prop: string) => {
  return ["__esModule", "$$typeof"].includes(prop);
};

const getCombinedSchema = <
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
>(
  options: ValidationOptions<TPrefix, TShared, TServer, TClient>,
  isServer: boolean,
) => {
  return {
    ...(options.shared && options.shared),
    ...(options.server && isServer && options.server),
    ...(options.client && options.client),
  };
};

const getFinalSchema = <
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
  TFinalSchema extends TSchema,
>(
  options: EnvOptions<
    TPrefix,
    TShared,
    TServer,
    TClient,
    TExtends,
    TFinalSchema
  >,
  isServer: boolean,
) => {
  const presets = options.extends?.reduce(
    (acc, preset) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        ...acc,
        ...getCombinedSchema(preset, isServer),
      };
    },
    {} as ValidationOptions<string, TShared, TServer, TClient>,
  );

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
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat = NonNullable<unknown>,
  TServer extends TServerFormat = NonNullable<unknown>,
  TClient extends TClientFormat = NonNullable<unknown>,
  const TExtends extends TExtendsFormat = [],
  TFinalSchema extends TSchema = FinalSchema<
    TShared,
    TServer,
    TClient,
    TExtends
  >,
>(
  options: EnvOptions<
    TPrefix,
    TShared,
    TServer,
    TClient,
    TExtends,
    TFinalSchema
  >,
): DefineEnv<TFinalSchema> {
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

  if (skip) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return values as any;
  }

  const schema = getFinalSchema(options, isServer);

  const parsed =
    options
      .transform?.(schema as never, isServer)
      ["~standard"].validate(values) ?? parseWithDictionary(schema, values);

  ensureSynchronous(parsed, "Validation must be synchronous!");

  if (parsed.issues) {
    onError(parsed.issues);
  }

  const isServerAccess = (prop: string) => {
    const isClientAccess = [options, ...(options.extends ?? [])]
      .map((preset) => ({
        keys: Object.keys(preset.client ?? {}),
        prefix: preset.clientPrefix,
      }))
      .some(
        (preset) =>
          preset.keys.includes(prop) &&
          (!preset.prefix || prop.startsWith(preset.prefix)),
      );

    const isSharedAccess = [
      ...Object.keys(options.shared ?? {}),
      ...(options.extends?.flatMap((ext) => Object.keys(ext.shared ?? {})) ??
        []),
    ].includes(prop);

    return !isSharedAccess && !isClientAccess;
  };
  const isValidServerAccess = (prop: string) => {
    return isServer || !isServerAccess(prop);
  };

  const env = new Proxy("value" in parsed ? parsed.value : {}, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreProp(prop)) return undefined;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return env as any;
}
