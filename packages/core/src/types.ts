import type { StandardSchemaDictionary, StandardSchemaV1 } from "./standard";

/** Type for error messages that must be strings */
export type ErrorMessage<T extends string> = T;

/** Creates a type where all properties are impossible to set */
// biome-ignore lint/suspicious/noExplicitAny: needs to be any
type Impossible<T extends Record<string, any>> = Partial<
  Record<keyof T, never>
>;

/** Merges two types, with B taking precedence over A */
type Merge<A, B> = Omit<A, keyof B> & B;

/** Simplifies a type by removing intersections and making it more readable */
export type Simplify<T> = {
  [P in keyof T]: T[P];
} & {};

/** Gets all keys from T that can be undefined */
type PossiblyUndefinedKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

/** Makes properties that can be undefined optional */
type UndefinedOptional<T> = Partial<Pick<T, PossiblyUndefinedKeys<T>>> &
  Omit<T, PossiblyUndefinedKeys<T>>;

/** Converts a readonly type to a mutable type */
type Mutable<T> = T extends Readonly<infer U> ? U : T;

/** Extracts the combined schema from validation options */
type ExtractCombinedSchema<T> = T extends ValidationOptions<
  TPrefixFormat,
  infer TShared,
  infer TServer,
  infer TClient
>
  ? CombinedSchema<TShared, TServer, TClient>
  : T extends Readonly<
        ValidationOptions<
          TPrefixFormat,
          infer TShared,
          infer TServer,
          infer TClient
        >
      >
    ? CombinedSchema<TShared, TServer, TClient>
    : never;

/** Reduces an array of schemas to a single schema */
type Reduce<
  TArr extends readonly unknown[] | unknown[],
  TAcc extends StandardSchemaDictionary<
    object,
    object
  > = StandardSchemaDictionary<object, object>,
> = TArr extends readonly [] | []
  ? TAcc
  : TArr extends
        | readonly [infer Head, ...infer Tail]
        // biome-ignore lint/suspicious/noRedeclare: it's not the same type
        | [infer Head, ...infer Tail]
    ? Tail extends readonly unknown[] | unknown[]
      ? Mutable<Reduce<Tail, CombinedSchema<TAcc, ExtractCombinedSchema<Head>>>>
      : never
    : never;

export type InferPresetOutput<T extends TExtendsFormat[number]> =
  StandardSchemaDictionary.InferOutput<ExtractCombinedSchema<T>>;

export type CombinedSchema<
  TShared extends TSharedFormat = TSharedFormat,
  TServer extends TServerFormat = TServerFormat,
  TClient extends TClientFormat = TClientFormat,
> = Merge<TShared, Merge<TServer, TClient>>;

export type TPrefixFormat = string | undefined;
export type TSharedFormat = StandardSchemaDictionary<object, object>;
export type TServerFormat = StandardSchemaDictionary<object, object>;
export type TClientFormat = StandardSchemaDictionary<object, object>;
export type TExtendsFormat =
  | (TPreset | Readonly<TPreset>)[]
  | ReadonlyArray<TPreset>;

export type TPreset<
  TPrefix extends TPrefixFormat = TPrefixFormat,
  TShared extends TSharedFormat = TSharedFormat,
  TServer extends TServerFormat = TServerFormat,
  TClient extends TClientFormat = TClientFormat,
> = ValidationOptions<TPrefix, TShared, TServer, TClient> & {
  id?: string;
};

export type TSchema = StandardSchemaV1<object, object>;

export interface BaseOptions<TExtends extends TExtendsFormat> {
  /**
   * Array of preset configurations to extend from.
   */
  extends?: TExtends;
  /**
   * Whether to skip validation of environment variables.
   * @default false
   */
  skip?: boolean;

  /**
   * Whether to treat environment as server-side.
   * @default typeof window === "undefined" || "Deno" in window
   */
  isServer?: boolean;

  /**
   * Called when validation fails. By default the error is logged,
   * and an error is thrown telling what environment variables are invalid.
   */
  onError?: (issues: StandardSchemaV1.FailureResult["issues"]) => never;

  /**
   * Called when a server-side environment variable is accessed on the client.
   * By default an error is thrown.
   */
  onInvalidAccess?: (variable: string) => never;
}

export interface LooseOptions<TExtends extends TExtendsFormat>
  extends BaseOptions<TExtends> {
  /**
   * Must be undefined when using loose options. Use `env` instead.
   */
  envStrict?: never;
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   * This doesn't enforce that all environment variables are set.
   */
  env?: Record<string, string | boolean | number | undefined>;
}

export interface StrictOptions<
  TPrefix extends TPrefixFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TShared extends TSharedFormat,
  TExtends extends TExtendsFormat,
> extends BaseOptions<TExtends> {
  /**
   * Runtime Environment variables to use for validation - `process.env`, `import.meta.env` or similar.
   * Enforces all environment variables to be set. Required in for example Next.js Edge and Client runtimes.
   */
  envStrict?: Record<
    | {
        [TKey in keyof TClient]: TPrefix extends undefined
          ? never
          : TKey extends `${TPrefix}${string}`
            ? TKey
            : never;
      }[keyof TClient]
    | {
        [TKey in keyof TServer]: TPrefix extends undefined
          ? TKey
          : TKey extends `${TPrefix}${string}`
            ? never
            : TKey;
      }[keyof TServer]
    | {
        [TKey in keyof TShared]: TKey extends string ? TKey : never;
      }[keyof TShared],
    string | boolean | number | undefined
  >;
  /**
   * Must be undefined when using strict options. Use `envStrict` instead.
   */
  env?: never;
}

export interface SharedOptions<TShared extends TSharedFormat> {
  /**
   * Specify your shared environment variables schema here. These variables are available on both client and server.
   */
  shared?: TShared;
}

export interface ClientOptions<
  TPrefix extends TPrefixFormat,
  TClient extends TClientFormat,
> {
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix?: TPrefix;

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  client?: Partial<{
    [TKey in keyof TClient]: TKey extends `${TPrefix}${string}`
      ? TClient[TKey]
      : ErrorMessage<`${TKey extends string
          ? TKey
          : never} is not prefixed with ${TPrefix}.`>;
  }>;
}

export interface ServerOptions<
  TPrefix extends TPrefixFormat,
  TServer extends TServerFormat,
> {
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: Partial<{
    [TKey in keyof TServer]: TPrefix extends undefined
      ? TServer[TKey]
      : TPrefix extends ""
        ? TServer[TKey]
        : TKey extends `${TPrefix}${string}`
          ? ErrorMessage<`${TKey extends `${TPrefix}${string}`
              ? TKey
              : never} should not prefixed with ${TPrefix}.`>
          : TServer[TKey];
  }>;
}

export type ValidationOptions<
  TPrefix extends TPrefixFormat = TPrefixFormat,
  TShared extends TSharedFormat = TSharedFormat,
  TServer extends TServerFormat = TServerFormat,
  TClient extends TClientFormat = TClientFormat,
> = (
  | (ClientOptions<TPrefix, TClient> & ServerOptions<TPrefix, TServer>)
  | (ServerOptions<TPrefix, TServer> & Impossible<ClientOptions<never, never>>)
  | (ClientOptions<TPrefix, TClient> & Impossible<ServerOptions<never, never>>)
) &
  SharedOptions<TShared>;

export interface TransformSchemaOptions<
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
  TFinalSchema extends TSchema,
> {
  /**
   * A custom function to combine the schemas.
   * Can be used to add further refinement or transformation.
   */
  transform?: (
    shape: Simplify<FullSchemaShape<TShared, TServer, TClient, TExtends>>,
    isServer: boolean,
  ) => TFinalSchema;
}

export type EnvOptions<
  TPrefix extends TPrefixFormat = TPrefixFormat,
  TShared extends TSharedFormat = TSharedFormat,
  TServer extends TServerFormat = TServerFormat,
  TClient extends TClientFormat = TClientFormat,
  TExtends extends TExtendsFormat = TExtendsFormat,
  TFinalSchema extends TSchema = TSchema,
> = (
  | LooseOptions<TExtends>
  | StrictOptions<TPrefix, TServer, TClient, TShared, TExtends>
) &
  ValidationOptions<TPrefix, TShared, TServer, TClient> &
  TransformSchemaOptions<TShared, TServer, TClient, TExtends, TFinalSchema>;

export type FullSchemaShape<
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
> = CombinedSchema<Reduce<TExtends>, CombinedSchema<TShared, TServer, TClient>>;

export type FinalSchema<
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
> = StandardSchemaV1<
  object,
  UndefinedOptional<
    StandardSchemaDictionary.InferOutput<
      FullSchemaShape<TShared, TServer, TClient, TExtends>
    >
  >
>;

export type DefineEnv<TFinalSchema extends TSchema = TSchema> = Simplify<
  Readonly<
    StandardSchemaV1.InferOutput<TFinalSchema> & {
      _schema: TFinalSchema;
    }
  >
>;
