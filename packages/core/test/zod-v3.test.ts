import { expectTypeOf } from "expect-type";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod/v3";
import { defineEnv } from "../src";

function ignoreErrors(cb: () => void) {
  try {
    cb();
  } catch {}
}

test("server vars should not be prefixed", () => {
  ignoreErrors(() => {
    defineEnv({
      clientPrefix: "FOO_",
      server: {
        // @ts-expect-error - server should not have FOO_ prefix
        FOO_BAR: z.string(),
        BAR: z.string(),
      },
    });
  });
});

test("client vars should be correctly prefixed", () => {
  ignoreErrors(() => {
    defineEnv({
      clientPrefix: "FOO_",
      client: {
        FOO_BAR: z.string(),
        // @ts-expect-error - no FOO_ prefix
        BAR: z.string(),
      },
    });
  });
});

describe("return type is correctly inferred", () => {
  test("simple", () => {
    const env = defineEnv({
      clientPrefix: "FOO_",
      server: { BAR: z.string() },
      client: { FOO_BAR: z.string() },
      env: {
        BAR: "bar",
        FOO_BAR: "foo",
      },
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR: string;
        FOO_BAR: string;
      }>
    >();

    expect(env).toMatchObject({
      BAR: "bar",
      FOO_BAR: "foo",
    });
  });

  test("with transforms", () => {
    const env = defineEnv({
      clientPrefix: "FOO_",
      server: { BAR: z.string().transform(Number) },
      client: { FOO_BAR: z.string() },
      env: {
        BAR: "123",
        FOO_BAR: "foo",
      },
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR: number;
        FOO_BAR: string;
      }>
    >();

    expect(env).toMatchObject({
      BAR: 123,
      FOO_BAR: "foo",
    });
  });

  test("without client vars", () => {
    const env = defineEnv({
      server: { BAR: z.string() },
      env: {
        BAR: "bar",
      },
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR: string;
      }>
    >();

    expect(env).toMatchObject({
      BAR: "bar",
    });
  });

  test("with empty env values", () => {
    const env = defineEnv({
      server: { BAR: z.string().optional() },
      shared: { BAZ: z.string() },
      env: {
        BAR: "",
        BAZ: "baz",
      },
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR?: string | undefined;
        BAZ: string;
      }>
    >();

    expect(env).toMatchObject({
      BAZ: "baz",
    });
    expect(env.BAR).toBeUndefined();
  });
});

test("can pass number and booleans", () => {
  const env = defineEnv({
    server: {
      PORT: z.coerce.number(),
      IS_DEV: z.enum(["true", "false"]).transform((v) => v === "true"),
    },
    env: {
      PORT: "123",
      IS_DEV: "true",
    },
  });

  expectTypeOf(env).toMatchObjectType<
    Readonly<{
      PORT: number;
      IS_DEV: boolean;
    }>
  >();

  expect(env).toMatchObject({
    PORT: 123,
    IS_DEV: true,
  });
});

describe("errors when validation fails", () => {
  test("envs are missing", () => {
    expect(() =>
      defineEnv({
        clientPrefix: "FOO_",
        server: { BAR: z.string() },
        client: { FOO_BAR: z.string() },
        env: {},
      }),
    ).toThrow("Invalid environment variables");
  });

  test("envs are invalid", () => {
    expect(() =>
      defineEnv({
        clientPrefix: "FOO_",
        server: {
          BAR: z.string().transform(Number).pipe(z.number()),
        },
        client: { FOO_BAR: z.string() },
        env: {
          BAR: "123abc",
          FOO_BAR: "foo",
        },
      }),
    ).toThrow("Invalid environment variables");
  });

  test("with custom error handler", () => {
    expect(() =>
      defineEnv({
        clientPrefix: "FOO_",
        server: {
          BAR: z.string().transform(Number).pipe(z.number()),
        },
        client: { FOO_BAR: z.string() },
        env: {
          BAR: "123abc",
          FOO_BAR: "foo",
        },
        onError: (issues) => {
          const barError = issues.find((issue) =>
            issue.path?.includes("BAR"),
          )?.message;
          throw new Error(`Custom Error: Invalid variable BAR: ${barError}`);
        },
      }),
    ).toThrow(
      "Custom Error: Invalid variable BAR: Expected number, received nan",
    );
  });
});

describe("errors when server var is accessed on client", () => {
  // Define base options that are valid
  const options = {
    clientPrefix: "FOO_",
    server: { BAR: z.string() },
    client: { FOO_BAR: z.string() },
    env: {
      BAR: "bar",
      FOO_BAR: "foo",
    },
  } as const;

  test("with default handler", () => {
    const env = defineEnv({
      ...options,
      isServer: false,
    });

    expect(() => env.BAR).toThrow(
      "❌ Attempted to access a server-side environment variable on the client: BAR",
    );
    expect(env.FOO_BAR).toBe("foo");
  });

  test("with custom handler", () => {
    const env = defineEnv({
      ...options,
      isServer: false,
      onInvalidAccess: (variable: string) => {
        throw new Error(
          `Custom Error: Attempted to access ${variable} on the client`,
        );
      },
    });

    expect(() => env.BAR).toThrow(
      "Custom Error: Attempted to access BAR on the client",
    );
    expect(env.FOO_BAR).toBe("foo");
  });
});

describe("client/server only mode", () => {
  test("client only", () => {
    const env = defineEnv({
      clientPrefix: "FOO_",
      client: {
        FOO_BAR: z.string(),
      },
      env: { FOO_BAR: "foo" },
    });

    expectTypeOf(env).toMatchObjectType<Readonly<{ FOO_BAR: string }>>();
    expect(env.FOO_BAR).toBe("foo");
  });

  test("server only", () => {
    const env = defineEnv({
      server: {
        BAR: z.string(),
      },
      env: { BAR: "bar" },
    });

    expectTypeOf(env).toMatchObjectType<Readonly<{ BAR: string }>>();
    expect(env.BAR).toBe("bar");
  });
});

describe("shared can be accessed on both server and client", () => {
  const processEnv = {
    NODE_ENV: "development",
    BAR: "bar",
    FOO_BAR: "foo",
  };

  const options = {
    shared: {
      NODE_ENV: z.enum(["development", "production", "test"]),
    },
    clientPrefix: "FOO_",
    server: { BAR: z.string() },
    client: { FOO_BAR: z.string() },
    env: processEnv,
  } as const;

  expectTypeOf(defineEnv(options)).toMatchObjectType<
    Readonly<{
      NODE_ENV: "development" | "production" | "test";
      BAR: string;
      FOO_BAR: string;
    }>
  >();

  test("server", () => {
    const env = defineEnv({ ...options, isServer: true });

    expect(env).toMatchObject({
      NODE_ENV: "development",
      BAR: "bar",
      FOO_BAR: "foo",
    });
  });

  test("client", () => {
    const env = defineEnv({ ...options, isServer: false });

    expect(() => env.BAR).toThrow(
      "❌ Attempted to access a server-side environment variable on the client: BAR",
    );
    expect(env.FOO_BAR).toBe("foo");
    expect(env.NODE_ENV).toBe("development");
  });
});

test("envs are readonly at type level", () => {
  const env = defineEnv({
    server: { BAR: z.string() },
    env: { BAR: "bar" },
  });

  expectTypeOf(env).toMatchObjectType<Readonly<{ BAR: string }>>();

  // The following line should error if uncommented:
  // env.BAR = "foo";

  expect(env).toMatchObject({ BAR: "bar" });
});

describe("extending presets", () => {
  test("with invalid runtime envs", () => {
    const processEnv = {
      SERVER_ENV: "server",
      CLIENT_ENV: "client",
    };

    function lazyCreateEnv() {
      const preset = {
        server: {
          PRESET_ENV: z.string(),
        },
      };

      return defineEnv({
        server: {
          SERVER_ENV: z.string(),
        },
        clientPrefix: "CLIENT_",
        client: {
          CLIENT_ENV: z.string(),
        },
        extends: [preset],
        env: processEnv,
      });
    }

    type Env = ReturnType<typeof lazyCreateEnv>;

    expectTypeOf<Env>().toMatchObjectType<
      Readonly<{
        SERVER_ENV: string;
        CLIENT_ENV: string;
        PRESET_ENV: string;
      }>
    >();

    const consoleError = vi.spyOn(console, "error");
    expect(() => lazyCreateEnv()).toThrow("Invalid environment variables");
    expect(consoleError.mock.calls[0]).toEqual([
      "❌ Invalid environment variables:",
      [
        expect.objectContaining({
          message: expect.any(String),
          path: ["PRESET_ENV"],
        }),
      ],
    ]);
  });
  describe("single preset", () => {
    const processEnv = {
      PRESET_ENV: "preset",
      SHARED_ENV: "shared",
      SERVER_ENV: "server",
      CLIENT_ENV: "client",
    };

    function lazyCreateEnv() {
      const preset = {
        server: {
          PRESET_ENV: z.enum(["preset"]),
        },
        env: processEnv,
      };

      return defineEnv({
        server: {
          SERVER_ENV: z.string(),
        },
        shared: {
          SHARED_ENV: z.string(),
        },
        clientPrefix: "CLIENT_",
        client: {
          CLIENT_ENV: z.string(),
        },
        extends: [preset],
        env: processEnv,
      });
    }

    type Env = ReturnType<typeof lazyCreateEnv>;

    expectTypeOf<Env>().toMatchObjectType<
      Readonly<{
        SERVER_ENV: string;
        SHARED_ENV: string;
        CLIENT_ENV: string;
        PRESET_ENV: "preset";
      }>
    >();

    test("server", () => {
      const { window } = globalThis;
      globalThis.window = undefined as any;

      const env = lazyCreateEnv();

      expect(env).toMatchObject({
        SERVER_ENV: "server",
        SHARED_ENV: "shared",
        CLIENT_ENV: "client",
        PRESET_ENV: "preset",
      });

      globalThis.window = window;
    });

    test("client", () => {
      const { window } = globalThis;
      globalThis.window = {} as any;

      const env = lazyCreateEnv();

      expect(() => env.SERVER_ENV).toThrow(
        "❌ Attempted to access a server-side environment variable on the client",
      );
      expect(() => env.PRESET_ENV).toThrow(
        "❌ Attempted to access a server-side environment variable on the client",
      );
      expect(env.SHARED_ENV).toBe("shared");
      expect(env.CLIENT_ENV).toBe("client");

      globalThis.window = window;
    });
  });

  describe("multiple presets", () => {
    const processEnv = {
      PRESET_ENV1: "preset",
      PRESET_ENV2: 123,
      SHARED_ENV: "shared",
      SERVER_ENV: "server",
      CLIENT_ENV: "client",
    };

    function lazyCreateEnv() {
      const preset1 = {
        server: {
          PRESET_ENV1: z.enum(["preset"]),
        },
      };

      const preset2 = {
        server: {
          PRESET_ENV2: z.number(),
        },
        runtimeEnv: processEnv,
      };

      return defineEnv({
        server: {
          SERVER_ENV: z.string(),
        },
        shared: {
          SHARED_ENV: z.string(),
        },
        clientPrefix: "CLIENT_",
        client: {
          CLIENT_ENV: z.string(),
        },
        extends: [preset1, preset2],
        env: processEnv,
      });
    }

    type Env = ReturnType<typeof lazyCreateEnv>;

    expectTypeOf<Env>().toMatchObjectType<
      Readonly<{
        PRESET_ENV1: "preset";
        PRESET_ENV2: number;
        SERVER_ENV: string;
        SHARED_ENV: string;
        CLIENT_ENV: string;
      }>
    >();

    test("server", () => {
      const { window } = globalThis;
      globalThis.window = undefined as any;

      const env = lazyCreateEnv();

      expect(env).toMatchObject({
        PRESET_ENV1: "preset",
        PRESET_ENV2: 123,
        SERVER_ENV: "server",
        SHARED_ENV: "shared",
        CLIENT_ENV: "client",
      });

      globalThis.window = window;
    });

    test("client", () => {
      const { window } = globalThis;
      globalThis.window = {} as any;

      const env = lazyCreateEnv();

      expect(() => env.SERVER_ENV).toThrow(
        "❌ Attempted to access a server-side environment variable on the client",
      );
      expect(() => env.PRESET_ENV1).toThrow(
        "❌ Attempted to access a server-side environment variable on the client",
      );
      expect(() => env.PRESET_ENV2).toThrow(
        "❌ Attempted to access a server-side environment variable on the client",
      );
      expect(env.SHARED_ENV).toBe("shared");
      expect(env.CLIENT_ENV).toBe("client");

      globalThis.window = window;
    });
  });
});

test("empty 'extends' array should not cause type errors", () => {
  const env = defineEnv({
    clientPrefix: "FOO_",
    server: { BAR: z.string() },
    client: { FOO_BAR: z.string() },
    env: {
      BAR: "bar",
      FOO_BAR: "foo",
    },
    extends: [],
  });

  expectTypeOf(env).toMatchObjectType<
    Readonly<{
      BAR: string;
      FOO_BAR: string;
    }>
  >();

  expect(env).toMatchObject({
    BAR: "bar",
    FOO_BAR: "foo",
  });
});

test("overriding preset env var", () => {
  const presetOptions = {
    server: {
      OVERRIDE_ME: z.string(),
    },
    shared: {
      SHARED_PRESET: z.enum(["true", "false"]).transform((v) => v === "true"),
    },
  };

  const currentEnv = { OVERRIDE_ME: "123", SHARED_PRESET: "true" };

  const env = defineEnv({
    server: {
      OVERRIDE_ME: z.coerce.number(),
    },
    // Cast preset to the expected type
    extends: [presetOptions],
    env: currentEnv,
  });

  expectTypeOf(env).toMatchObjectType<
    Readonly<{
      OVERRIDE_ME: number;
      SHARED_PRESET: boolean;
    }>
  >();
  expect(env.OVERRIDE_ME).toBe(123);
  expect(env.SHARED_PRESET).toBe(true);
});

describe("skip validation", () => {
  test("should not throw if skip is true", () => {
    const env = defineEnv({
      server: { BAR: z.string() },
      env: {},
      skip: true,
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR: string;
      }>
    >();

    expect(env.BAR).toBeUndefined();
  });

  test("should return default values if skip is true", () => {
    const env = defineEnv({
      server: { BAR: z.string().default("bar") },
      env: {},
      skip: true,
    });
    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        BAR: string;
      }>
    >();
    expect(env.BAR).toBe("bar");
  });
});

test("empty strings are removed from env before validation", () => {
  expect(() =>
    defineEnv({
      server: { REQ_VAR: z.string() },
      env: {
        REQ_VAR: "",
      },
    }),
  ).toThrow("Invalid environment variables");

  const env = defineEnv({
    server: { OPT_VAR: z.string().optional() },
    env: {
      OPT_VAR: "",
    },
  });
  expect(env.OPT_VAR).toBeUndefined();
});

describe("transforming final schema", () => {
  test("final schema combiner", () => {
    let receivedIsServer = false;
    const env = defineEnv({
      server: {
        SERVER_ENV: z.string(),
      },
      shared: {
        SHARED_ENV: z.string(),
      },
      clientPrefix: "CLIENT_",
      client: {
        CLIENT_ENV: z.string(),
      },
      env: {
        SERVER_ENV: "server",
        SHARED_ENV: "shared",
        CLIENT_ENV: "client",
      },
      transform: (shape, isServer) => {
        expectTypeOf(isServer).toEqualTypeOf<boolean>();
        if (typeof isServer === "boolean") receivedIsServer = true;
        return z.object(shape);
      },
    });

    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        SERVER_ENV: string;
        SHARED_ENV: string;
        CLIENT_ENV: string;
      }>
    >();

    expect(env).toMatchObject({
      SERVER_ENV: "server",
      SHARED_ENV: "shared",
      CLIENT_ENV: "client",
    });

    expect(receivedIsServer).toBe(true);
  });
  test("schema combiner with further refinement", () => {
    const env = defineEnv({
      server: {
        SKIP_AUTH: z.boolean().optional(),
        EMAIL: z.string().email().optional(),
        PASSWORD: z.string().min(1).optional(),
      },
      env: {
        SKIP_AUTH: true,
      },
      transform: (shape) =>
        z.object(shape).refine((env) => {
          expectTypeOf(env).toMatchObjectType<{
            SKIP_AUTH?: boolean;
            EMAIL?: string;
            PASSWORD?: string;
          }>();
          return env.SKIP_AUTH || (env.EMAIL && env.PASSWORD);
        }),
    });
    expectTypeOf(env).toMatchObjectType<
      Readonly<{
        SKIP_AUTH?: boolean;
        EMAIL?: string;
        PASSWORD?: string;
      }>
    >();
    expect(env).toMatchObject({ SKIP_AUTH: true });
  });
  test("schema combiner that changes the type", () => {
    const env = defineEnv({
      server: {
        SKIP_AUTH: z.boolean().optional(),
        EMAIL: z.string().email().optional(),
        PASSWORD: z.string().min(1).optional(),
      },
      transform: (shape) =>
        z.object(shape).transform((env, ctx) => {
          if (env.SKIP_AUTH) return { SKIP_AUTH: true } as const;
          if (!env.EMAIL || !env.PASSWORD) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "EMAIL and PASSWORD are required if SKIP_AUTH is false",
            });
            return z.NEVER;
          }
          return {
            EMAIL: env.EMAIL,
            PASSWORD: env.PASSWORD,
          };
        }),
      env: {
        SKIP_AUTH: true,
      },
    });
    // @ts-expect-error - we want to test the type of the env object, not the schema
    expectTypeOf<Omit<typeof env, "_schema">>().toEqualTypeOf<
      Readonly<
        | {
            SKIP_AUTH: true;
            EMAIL: undefined;
            PASSWORD: undefined;
          }
        | {
            SKIP_AUTH: undefined;
            EMAIL: string;
            PASSWORD: string;
          }
      >
    >();
    expect(env).toMatchObject({ SKIP_AUTH: true });
  });
});
