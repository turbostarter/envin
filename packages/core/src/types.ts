import {
  type TypeOf,
  type ZodError,
  type ZodIntersection,
  type ZodObject,
  type ZodSchema,
  type ZodType,
  type ZodUnknown,
  type objectUtil,
  z,
} from "zod";

export type ErrorMessage<T extends string> = T;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Impossible<T extends Record<string, any>> = Partial<
  Record<keyof T, never>
>;

type ExtractCombinedSchema<T> =
  T extends ValidationOptions<
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

type Reduce<
  TArr extends readonly unknown[] | unknown[],
  TAcc extends ZodType = ZodUnknown,
> = TArr extends readonly [] | []
  ? TAcc
  : TArr extends
        | readonly [infer Head, ...infer Tail]
        // biome-ignore lint/suspicious/noRedeclare: <explanation>
        | [infer Head, ...infer Tail]
    ? Tail extends readonly unknown[] | unknown[]
      ? Reduce<Tail, CombinedSchema<TAcc, ExtractCombinedSchema<Head>>>
      : TAcc
    : TAcc;

type IsUnknownSchema<T extends ZodSchema<unknown>> =
  T extends ZodSchema<infer TType>
    ? unknown extends TType
      ? true
      : false
    : true;

type MergeOrIntersectKnownSchemas<
  S1 extends ZodSchema,
  S2 extends ZodSchema,
> = [S1, S2] extends [ZodObject<infer Shape1>, ZodObject<infer Shape2>]
  ? ZodObject<objectUtil.MergeShapes<Shape1, Shape2>>
  : ZodIntersection<S1, S2>;

type CombineSchemas<
  T1 extends ZodSchema<unknown> = ZodSchema<unknown>,
  T2 extends ZodSchema<unknown> = ZodSchema<unknown>,
> =
  IsUnknownSchema<T1> extends true
    ? IsUnknownSchema<T2> extends true
      ? ZodUnknown
      : T2 extends ZodSchema
        ? T2
        : ZodUnknown
    : IsUnknownSchema<T2> extends true
      ? T1 extends ZodSchema
        ? T1
        : ZodUnknown
      : T1 extends ZodSchema
        ? T2 extends ZodSchema
          ? MergeOrIntersectKnownSchemas<T1, T2>
          : ZodUnknown
        : ZodUnknown;

export type InferPresetOutput<T extends TExtendsFormat[number]> = TypeOf<
  ExtractCombinedSchema<T>
>;

export type CombinedSchema<
  TShared extends TSharedFormat = TSharedFormat,
  TServer extends TServerFormat = TServerFormat,
  TClient extends TClientFormat = TClientFormat,
  TAcc extends ZodSchema<unknown> = ZodSchema<unknown>,
> =
  IsUnknownSchema<TAcc> extends true
    ? CombineSchemas<CombineSchemas<TShared, TServer>, TClient>
    : CombineSchemas<TAcc, CombineSchemas<TShared, TServer>>;

export type TPrefixFormat = string | undefined;
export type TSharedFormat<T = unknown> = ZodSchema<T> | Readonly<ZodSchema<T>>;
export type TServerFormat<T = unknown> = ZodSchema<T>;
export type TClientFormat<T = unknown> = ZodSchema<T>;
export type TExtendsFormat =
  | (ValidationOptions | Readonly<ValidationOptions>)[]
  | ReadonlyArray<ValidationOptions>;
export type TSchema = ZodSchema<unknown>;

export interface BaseOptions<TExtends extends TExtendsFormat> {
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
  onError?: (error: ZodError) => never;

  /**
   * Called when a server-side environment variable is accessed on the client.
   * By default an error is thrown.
   */
  onInvalidAccess?: (variable: string) => never;
}

export interface LooseOptions<TExtends extends TExtendsFormat>
  extends BaseOptions<TExtends> {
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  // This doesn't enforce that all environment variables are set.
  env?: Record<string, string | boolean | number | undefined>;
}

export interface SharedOptions<TShared extends TSharedFormat> {
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
  client?: TClient extends ZodObject<
    infer R1,
    infer R2,
    infer R3,
    infer R4,
    unknown
  >
    ? TClient extends never
      ? TClient
      : ZodObject<
          R1,
          R2,
          R3,
          R4,
          {
            [TKey in keyof TClient["_input"]]: TKey extends `${TPrefix}${string}`
              ? TClient[TKey]
              : ErrorMessage<`${TKey extends string
                  ? TKey
                  : never} is not prefixed with ${TPrefix}.`>;
          }
        >
    : TClient;
}

export interface ServerOptions<
  TPrefix extends TPrefixFormat,
  TServer extends TServerFormat,
> {
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server?: TServer extends ZodObject<
    infer R1,
    infer R2,
    infer R3,
    infer R4,
    unknown
  >
    ? TServer extends never
      ? TServer
      : TPrefix extends undefined
        ? TServer
        : TPrefix extends ""
          ? TServer
          : ZodObject<
              R1,
              R2,
              R3,
              R4,
              {
                [TKey in keyof TServer["_input"]]: TKey extends `${TPrefix}${string}`
                  ? ErrorMessage<`${TKey extends `${TPrefix}${string}`
                      ? TKey
                      : never} should not prefixed with ${TPrefix}.`>
                  : TServer["_input"][TKey];
              }
            >
    : TServer;
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

export type EnvOptions<
  TPrefix extends TPrefixFormat,
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
> = LooseOptions<TExtends> &
  ValidationOptions<TPrefix, TShared, TServer, TClient>;

export type FinalSchema<
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
> = CombinedSchema<Reduce<TExtends>, CombinedSchema<TShared, TServer, TClient>>;

export type DefineEnv<
  TShared extends TSharedFormat,
  TServer extends TServerFormat,
  TClient extends TClientFormat,
  TExtends extends TExtendsFormat,
> = Readonly<TypeOf<FinalSchema<TShared, TServer, TClient, TExtends>>>;
