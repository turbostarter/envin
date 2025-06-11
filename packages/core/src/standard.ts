/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (
      value: unknown,
    ) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }

  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }

  /** The Standard Schema types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Schema. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["input"];

  /** Infers the output type of a Standard Schema. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
    Schema["~standard"]["types"]
  >["output"];
}

/** A dictionary of Standard Schema objects mapping input keys to their corresponding schemas. */
export type StandardSchemaDictionary<
  Input = Record<string, unknown>,
  Output extends Record<keyof Input, unknown> = Input,
> = {
  [K in keyof Input]-?: StandardSchemaV1<Input[K], Output[K]>;
};

export namespace StandardSchemaDictionary {
  /** Infers the input types from a Standard Schema Dictionary. */
  export type InferInput<T extends StandardSchemaDictionary> = {
    [K in keyof T]: StandardSchemaV1.InferInput<T[K]>;
  };
  /** Infers the output types from a Standard Schema Dictionary. */
  export type InferOutput<T extends StandardSchemaDictionary> = {
    [K in keyof T]: StandardSchemaV1.InferOutput<T[K]>;
  };
}

/** Ensures a value is synchronous by throwing an error if it's a Promise. */
export function ensureSynchronous<T>(
  value: T | Promise<T>,
  message: string,
): asserts value is T {
  if (value instanceof Promise) {
    throw new Error(message);
  }
}

/** Parses a value using a dictionary of Standard Schema objects. */
export function parseWithDictionary<TDict extends StandardSchemaDictionary>(
  dictionary: TDict,
  value: Record<string, unknown>,
): StandardSchemaV1.Result<StandardSchemaDictionary.InferOutput<TDict>> {
  const result: Record<string, unknown> = {};
  const issues: StandardSchemaV1.Issue[] = [];
  for (const key in dictionary) {
    const propResult = dictionary[key]?.["~standard"].validate(value[key]);

    ensureSynchronous(
      propResult,
      `Validation must be synchronous, but ${key} returned a Promise.`,
    );

    if (propResult?.issues) {
      issues.push(
        ...propResult.issues.map((issue) => ({
          ...issue,
          path: [key, ...(issue.path ?? [])],
        })),
      );
      continue;
    }
    result[key] = propResult?.value;
  }
  if (issues.length) {
    return { issues };
  }
  return { value: result as never };
}

/** Checks if a value is a Standard Schema object. */
export const isStandardSchema = (
  schema: unknown,
): schema is StandardSchemaV1 => {
  return (
    ["function", "object"].includes(typeof schema) &&
    !!schema &&
    // @ts-expect-error - we want to check if the schema is a Standard Schema object (even if it's a function)
    "~standard" in schema &&
    typeof schema["~standard"] === "object" &&
    !!schema["~standard"] &&
    "validate" in schema["~standard"]
  );
};

/** Gets the default value from a Standard Schema object. */
export const getDefault = (schema: StandardSchemaV1) => {
  if (typeof schema !== "object" || schema === null) {
    return undefined;
  }

  if (
    "default" in schema &&
    !["object", "function"].includes(typeof schema.default)
  ) {
    return schema.default;
  }

  if (
    "_def" in schema &&
    typeof schema._def === "object" &&
    schema._def !== null &&
    "defaultValue" in schema._def &&
    typeof schema._def.defaultValue === "function"
  ) {
    return schema._def.defaultValue?.();
  }

  return undefined;
};

/** Gets default values from a dictionary of Standard Schema objects. */
export const getDefaultDictionary = (schema: StandardSchemaDictionary) => {
  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => [key, getDefault(value)]),
  );
};
