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
type ExtractExtendsArray<T> = T extends { extends?: infer E }
  ? E extends ExtendsFormat
    ? E
    : []
  : [];

type ExtractCombinedSchema<T> = T extends ValidationOptions<
  PrefixFormat,
  infer Shared,
  infer Server,
  infer Client
>
  ? CombinedSchema<
      Reduce<ExtractExtendsArray<T>>,
      CombinedSchema<Shared, Server, Client>
    >
  : T extends Readonly<
        ValidationOptions<
          PrefixFormat,
          infer Shared,
          infer Server,
          infer Client
        >
      >
    ? CombinedSchema<
        Reduce<ExtractExtendsArray<T>>,
        CombinedSchema<Shared, Server, Client>
      >
    : CombinedSchema<
        Reduce<ExtractExtendsArray<T>>,
        CombinedSchema<
          T extends { shared: infer S }
            ? S extends SharedFormat
              ? S
              : StandardSchemaDictionary<object, object>
            : StandardSchemaDictionary<object, object>,
          T extends { server: infer Sv }
            ? Sv extends ServerFormat
              ? Sv
              : StandardSchemaDictionary<object, object>
            : StandardSchemaDictionary<object, object>,
          T extends { client: infer C }
            ? C extends ClientFormat
              ? C
              : StandardSchemaDictionary<object, object>
            : StandardSchemaDictionary<object, object>
        >
      >;

/** Reduces an array of schemas to a single schema */
type Reduce<
  Arr extends readonly unknown[] | unknown[],
  Acc extends StandardSchemaDictionary<
    object,
    object
  > = StandardSchemaDictionary<object, object>,
> = Arr extends readonly [] | []
  ? Acc
  : Arr extends
        | readonly [infer Head, ...infer Tail]
        // biome-ignore lint/suspicious/noRedeclare: it's not the same type
        | [infer Head, ...infer Tail]
    ? Tail extends readonly unknown[] | unknown[]
      ? Mutable<Reduce<Tail, CombinedSchema<Acc, ExtractCombinedSchema<Head>>>>
      : never
    : never;

export type InferPresetOutput<T extends ExtendsFormat[number]> =
  StandardSchemaDictionary.InferOutput<ExtractCombinedSchema<T>>;

export type CombinedSchema<
  Shared extends SharedFormat = SharedFormat,
  Server extends ServerFormat = ServerFormat,
  Client extends ClientFormat = ClientFormat,
> = Merge<Shared, Merge<Server, Client>>;

export type PrefixFormat = string | undefined;
export type SharedFormat = StandardSchemaDictionary<object, object>;
export type ServerFormat = StandardSchemaDictionary<object, object>;
export type ClientFormat = StandardSchemaDictionary<object, object>;
export type ExtendsFormat =
  | (Preset | Readonly<Preset>)[]
  | ReadonlyArray<Preset>;

export type Preset<
  Prefix extends PrefixFormat = PrefixFormat,
  Shared extends SharedFormat = SharedFormat,
  Server extends ServerFormat = ServerFormat,
  Client extends ClientFormat = ClientFormat,
  Extends extends ExtendsFormat = ExtendsFormat,
> = ValidationOptions<Prefix, Shared, Server, Client> & {
  id?: string;
  extends?: Extends;
};

export type Schema = StandardSchemaV1<object, object>;

export interface BaseOptions<Extends extends ExtendsFormat> {
  /**
   * Array of preset configurations to extend from.
   */
  extends?: Extends;
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

export interface LooseOptions<Extends extends ExtendsFormat>
  extends BaseOptions<Extends> {
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
  Prefix extends PrefixFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
  Shared extends SharedFormat,
  Extends extends ExtendsFormat,
> extends BaseOptions<Extends> {
  /**
   * Runtime Environment variables to use for validation - `process.env`, `import.meta.env` or similar.
   * Enforces all environment variables to be set. Required in for example Next.js Edge and Client runtimes.
   */
  envStrict?: Record<
    | {
        [Key in keyof Client]: Prefix extends undefined
          ? never
          : Key extends `${Prefix}${string}`
            ? Key
            : never;
      }[keyof Client]
    | {
        [Key in keyof Server]: Prefix extends undefined
          ? Key
          : Key extends `${Prefix}${string}`
            ? never
            : Key;
      }[keyof Server]
    | {
        [Key in keyof Shared]: Key extends string ? Key : never;
      }[keyof Shared],
    string | boolean | number | undefined
  >;
  /**
   * Must be undefined when using strict options. Use `envStrict` instead.
   */
  env?: never;
}

export interface SharedOptions<Shared extends SharedFormat> {
  /**
   * Specify your shared environment variables schema here. These variables are available on both client and server.
   */
  shared?: Shared;
}

export interface ClientOptions<
  Prefix extends PrefixFormat,
  Client extends ClientFormat,
> {
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix?: Prefix;

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  client?: Partial<{
    [Key in keyof Client]: Key extends `${Prefix}${string}`
      ? Client[Key]
      : ErrorMessage<`${Key extends string
          ? Key
          : never} is not prefixed with ${Prefix}.`>;
  }>;
}

export interface ServerOptions<
  Prefix extends PrefixFormat,
  Server extends ServerFormat,
> {
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: Partial<{
    [Key in keyof Server]: Prefix extends undefined
      ? Server[Key]
      : Prefix extends ""
        ? Server[Key]
        : Key extends `${Prefix}${string}`
          ? ErrorMessage<`${Key extends `${Prefix}${string}`
              ? Key
              : never} should not prefixed with ${Prefix}.`>
          : Server[Key];
  }>;
}

export type ValidationOptions<
  Prefix extends PrefixFormat = PrefixFormat,
  Shared extends SharedFormat = SharedFormat,
  Server extends ServerFormat = ServerFormat,
  Client extends ClientFormat = ClientFormat,
> = (
  | (ClientOptions<Prefix, Client> & ServerOptions<Prefix, Server>)
  | (ServerOptions<Prefix, Server> & Impossible<ClientOptions<never, never>>)
  | (ClientOptions<Prefix, Client> & Impossible<ServerOptions<never, never>>)
) &
  SharedOptions<Shared>;

export interface TransformSchemaOptions<
  Shared extends SharedFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
  Extends extends ExtendsFormat,
  FinalSchema extends Schema,
> {
  /**
   * A custom function to combine the schemas.
   * Can be used to add further refinement or transformation.
   */
  transform?: (
    shape: Simplify<FullSchemaShape<Shared, Server, Client, Extends>>,
    isServer: boolean,
  ) => FinalSchema;
}

export type EnvOptions<
  Prefix extends PrefixFormat = PrefixFormat,
  Shared extends SharedFormat = SharedFormat,
  Server extends ServerFormat = ServerFormat,
  Client extends ClientFormat = ClientFormat,
  Extends extends ExtendsFormat = ExtendsFormat,
  FinalSchema extends Schema = Schema,
> = (
  | LooseOptions<Extends>
  | StrictOptions<Prefix, Server, Client, Shared, Extends>
) &
  ValidationOptions<Prefix, Shared, Server, Client> &
  TransformSchemaOptions<Shared, Server, Client, Extends, FinalSchema>;

export type FullSchemaShape<
  Shared extends SharedFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
  Extends extends ExtendsFormat,
> = CombinedSchema<Reduce<Extends>, CombinedSchema<Shared, Server, Client>>;

export type FinalSchema<
  Shared extends SharedFormat,
  Server extends ServerFormat,
  Client extends ClientFormat,
  Extends extends ExtendsFormat,
> = StandardSchemaV1<
  object,
  UndefinedOptional<
    StandardSchemaDictionary.InferOutput<
      FullSchemaShape<Shared, Server, Client, Extends>
    >
  >
>;

export type DefineEnv<FinalSchema extends Schema = Schema> = Simplify<
  Readonly<
    StandardSchemaV1.InferOutput<FinalSchema> & {
      _schema: FinalSchema;
    }
  >
>;
