/// <reference types="bun" />
import { describe, expect, spyOn, test } from "bun:test";
import { expectTypeOf } from "expect-type";

import { z } from "zod";
import { defineEnv } from "../src";

function ignoreErrors(cb: () => void) {
  try {
    cb();
  } catch (err) {}
}

test("server vars should not be prefixed", () => {
  ignoreErrors(() => {
    defineEnv({
      clientPrefix: "FOO_",
      // @ts-expect-error - server should not have FOO_ prefix
      server: z.object({
        FOO_BAR: z.string(),
        BAR: z.string(),
      }),
    });
  });
});

test("client vars should be correctly prefixed", () => {
  ignoreErrors(() => {
    defineEnv({
      clientPrefix: "FOO_",
      // @ts-expect-error - no FOO_ prefix
      client: z.object({
        FOO_BAR: z.string(),
        BAR: z.string(),
      }),
    });
  });
});

describe("return type is correctly inferred", () => {
  test("simple", () => {
    const env = defineEnv({
      clientPrefix: "FOO_",
      server: z.object({ BAR: z.string() }),
      client: z.object({ FOO_BAR: z.string() }),
      env: {
        BAR: "bar",
        FOO_BAR: "foo",
      },
    });

    expectTypeOf(env).toEqualTypeOf<
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
      server: z.object({ BAR: z.string().transform(Number) }),
      client: z.object({ FOO_BAR: z.string() }),
      env: {
        BAR: "123",
        FOO_BAR: "foo",
      },
    });

    expectTypeOf(env).toEqualTypeOf<
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
      server: z.object({ BAR: z.string() }),
      env: {
        BAR: "bar",
      },
    });

    expectTypeOf(env).toEqualTypeOf<
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
      server: z.object({ BAR: z.string().optional() }),
      shared: z.object({ BAZ: z.string() }),
      env: {
        BAR: "",
        BAZ: "baz",
      },
    });

    expectTypeOf(env).toEqualTypeOf<
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

  test("with discriminated union", () => {
    const env = defineEnv({
      server: z.discriminatedUnion("BAR", [
        z.object({
          BAR: z.literal("bar"),
          FOO_BAR: z.string(),
        }),
        z.object({
          BAR: z.literal("foo"),
          FOO_BAR: z.number(),
        }),
      ]),
      env: {
        BAR: "bar",
        FOO_BAR: "foo",
      },
    });

    expectTypeOf(env).toEqualTypeOf<
      Readonly<
        | {
            BAR: "bar";
            FOO_BAR: string;
          }
        | {
            BAR: "foo";
            FOO_BAR: number;
          }
      >
    >();

    if (env.BAR === "bar") {
      expectTypeOf(env.FOO_BAR).toEqualTypeOf<string>();
    } else {
      expectTypeOf(env.FOO_BAR).toEqualTypeOf<number>();
    }

    expect(env).toMatchObject({
      BAR: "bar",
      FOO_BAR: "foo",
    });
  });
});

test("can pass number and booleans", () => {
  const env = defineEnv({
    server: z.object({
      PORT: z.coerce.number(),
      IS_DEV: z.enum(["true", "false"]).transform((v) => v === "true"),
    }),
    env: {
      PORT: "123",
      IS_DEV: "true",
    },
  });

  expectTypeOf(env).toEqualTypeOf<
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
        server: z.object({ BAR: z.string() }),
        client: z.object({ FOO_BAR: z.string() }),
        env: {},
      }),
    ).toThrow("Invalid environment variables");
  });

  test("envs are invalid", () => {
    expect(() =>
      defineEnv({
        clientPrefix: "FOO_",
        server: z.object({
          BAR: z.string().transform(Number).pipe(z.number()),
        }),
        client: z.object({ FOO_BAR: z.string() }),
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
        server: z.object({
          BAR: z.string().transform(Number).pipe(z.number()),
        }),
        client: z.object({ FOO_BAR: z.string() }),
        env: {
          BAR: "123abc",
          FOO_BAR: "foo",
        },
        onError: (error) => {
          const barError = error.flatten().fieldErrors.BAR?.[0];
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
    server: z.object({ BAR: z.string() }),
    client: z.object({ FOO_BAR: z.string() }),
    env: {
      BAR: "bar",
      FOO_BAR: "foo",
    },
  } as const;

  test("with default handler", () => {
    // Pass the explicitly typed options object
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
    // Pass the explicitly typed options object
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
      client: z.object({
        FOO_BAR: z.string(),
      }),
      env: { FOO_BAR: "foo" },
    });

    expectTypeOf(env).toEqualTypeOf<Readonly<{ FOO_BAR: string }>>();
    expect(env.FOO_BAR).toBe("foo");
  });

  test("server only", () => {
    const env = defineEnv({
      server: z.object({
        BAR: z.string(),
      }),
      env: { BAR: "bar" },
    });

    expectTypeOf(env).toEqualTypeOf<Readonly<{ BAR: string }>>();
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
    shared: z.object({
      NODE_ENV: z.enum(["development", "production", "test"]),
    }),
    clientPrefix: "FOO_",
    server: z.object({ BAR: z.string() }),
    client: z.object({ FOO_BAR: z.string() }),
    env: processEnv,
  } as const;

  expectTypeOf(defineEnv(options)).toEqualTypeOf<
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
    server: z.object({ BAR: z.string() }),
    env: { BAR: "bar" },
  });

  expectTypeOf(env).toEqualTypeOf<Readonly<{ BAR: string }>>();

  // The following line should error if uncommented:
  // env.BAR = "foo";

  expect(env).toMatchObject({ BAR: "bar" });
});

describe("extending presets", () => {
  const baseEnv = {
    SHARED_ENV: "shared",
    SERVER_ENV: "server",
    CLIENT_ENV: "client",
  };

  // Define preset options as partial ValidationOptions for clarity in extends
  const preset1Options = {
    server: z.object({
      PRESET_SERVER1: z.enum(["preset1"]),
    }),
    shared: z.object({
      PRESET_SHARED1: z.enum(["true", "false"]).transform((v) => v === "true"),
    }),
  } as const;

  const preset2Options = {
    clientPrefix: "PRESET2_",
    client: z.object({
      PRESET2_CLIENT: z.coerce.number(),
    }),
  } as const;

  test("with invalid runtime envs (missing preset var)", () => {
    const currentEnv = {
      ...baseEnv,
      // Missing PRESET_SERVER1, PRESET_SHARED1, PRESET2_CLIENT
    };

    const consoleError = spyOn(console, "error");

    expect(() =>
      defineEnv({
        server: z.object({ SERVER_ENV: z.string() }),
        shared: z.object({ SHARED_ENV: z.string() }),
        clientPrefix: "CLIENT_",
        client: z.object({ CLIENT_ENV: z.string() }),
        // Cast presets to the expected type for extends
        extends: [preset1Options, preset2Options],
        env: currentEnv,
      }),
    ).toThrow("Invalid environment variables");

    expect(consoleError).toHaveBeenCalled();
    expect(consoleError.mock.calls[0][0]).toBe(
      "❌ Invalid environment variables:",
    );
    const errorFields = consoleError.mock.calls[0][1];
    expect(errorFields).toHaveProperty("PRESET_SERVER1");
    expect(errorFields).toHaveProperty("PRESET_SHARED1");
    expect(errorFields).toHaveProperty("PRESET2_CLIENT");

    consoleError.mockRestore();
  });

  describe("single preset", () => {
    const currentEnv = {
      ...baseEnv,
      PRESET_SERVER1: "preset1",
      PRESET_SHARED1: "true",
    };

    const finalOptions = {
      server: z.object({ SERVER_ENV: z.string() }),
      shared: z.object({ SHARED_ENV: z.string() }),
      clientPrefix: "CLIENT_",
      client: z.object({ CLIENT_ENV: z.string() }),
      // Cast preset to the expected type
      env: currentEnv,
      extends: [preset1Options],
    } as const;

    expectTypeOf(defineEnv(finalOptions)).toEqualTypeOf<
      Readonly<{
        SERVER_ENV: string;
        SHARED_ENV: string;
        CLIENT_ENV: string;
        PRESET_SERVER1: "preset1";
        PRESET_SHARED1: boolean;
      }>
    >();

    test("server", () => {
      const env = defineEnv({ ...finalOptions, isServer: true });
      expect(env).toMatchObject({
        SERVER_ENV: "server",
        SHARED_ENV: "shared",
        CLIENT_ENV: "client",
        PRESET_SERVER1: "preset1",
        PRESET_SHARED1: true,
      });
    });

    test("client", () => {
      const env = defineEnv({ ...finalOptions, isServer: false });
      expect(() => env.SERVER_ENV).toThrow(/Attempted to access a server-side/);
      expect(() => env.PRESET_SERVER1).toThrow(
        /Attempted to access a server-side/,
      );
      expect(env.SHARED_ENV).toBe("shared");
      expect(env.PRESET_SHARED1).toBe(true);
      expect(env.CLIENT_ENV).toBe("client");
    });
  });

  describe("multiple presets", () => {
    const currentEnv = {
      ...baseEnv,
      PRESET_SERVER1: "preset1",
      PRESET_SHARED1: "false",
      PRESET2_CLIENT: "123",
    };

    const finalOptions = {
      server: z.object({ SERVER_ENV: z.string() }),
      shared: z.object({ SHARED_ENV: z.string() }),
      clientPrefix: "CLIENT_",
      client: z.object({ CLIENT_ENV: z.string() }),
      // Cast presets to the expected type
      extends: [preset1Options, preset2Options],
      env: currentEnv,
    } as const;

    expectTypeOf(defineEnv(finalOptions)).toEqualTypeOf<
      Readonly<{
        SERVER_ENV: string;
        SHARED_ENV: string;
        CLIENT_ENV: string;
        PRESET_SERVER1: "preset1";
        PRESET_SHARED1: boolean;
        PRESET2_CLIENT: number;
      }>
    >();

    test("server", () => {
      const env = defineEnv({ ...finalOptions, isServer: true });
      expect(env).toMatchObject({
        SERVER_ENV: "server",
        SHARED_ENV: "shared",
        CLIENT_ENV: "client",
        PRESET_SERVER1: "preset1",
        PRESET_SHARED1: false,
        PRESET2_CLIENT: 123,
      });
    });

    test("client", () => {
      const env = defineEnv({ ...finalOptions, isServer: false });
      expect(() => env.SERVER_ENV).toThrow(/Attempted to access a server-side/);
      expect(() => env.PRESET_SERVER1).toThrow(
        /Attempted to access a server-side/,
      );
      expect(env.SHARED_ENV).toBe("shared");
      expect(env.PRESET_SHARED1).toBe(false);
      expect(env.CLIENT_ENV).toBe("client");
      expect(env.PRESET2_CLIENT).toBe(123);
    });
  });
});

test("empty 'extends' array should not cause type errors", () => {
  const env = defineEnv({
    clientPrefix: "FOO_",
    server: z.object({ BAR: z.string() }),
    client: z.object({ FOO_BAR: z.string() }),
    env: {
      BAR: "bar",
      FOO_BAR: "foo",
    },
    extends: [],
  });

  expectTypeOf(env).toEqualTypeOf<
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
    server: z.object({
      OVERRIDE_ME: z.string(),
    }),
    shared: z.object({
      SHARED_PRESET: z.enum(["true", "false"]).transform((v) => v === "true"),
    }),
  };

  const currentEnv = { OVERRIDE_ME: "123", SHARED_PRESET: "true" };

  const env = defineEnv({
    server: z.object({
      OVERRIDE_ME: z.coerce.number(),
    }),
    // Cast preset to the expected type
    extends: [presetOptions],
    env: currentEnv,
  });

  expectTypeOf(env).toEqualTypeOf<
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
      server: z.object({ BAR: z.string() }),
      env: {},
      skip: true,
    });

    expectTypeOf(env).toEqualTypeOf<
      Readonly<{
        BAR: string;
      }>
    >();

    expect(env.BAR).toBeUndefined();
  });

  test("should return default values if skip is true", () => {
    const env = defineEnv({
      server: z.object({ BAR: z.string().default("bar") }),
      env: {},
      skip: true,
    });
    expectTypeOf(env).toEqualTypeOf<
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
      server: z.object({ REQ_VAR: z.string() }),
      env: {
        REQ_VAR: "",
      },
    }),
  ).toThrow("Invalid environment variables");

  const env = defineEnv({
    server: z.object({ OPT_VAR: z.string().optional() }),
    env: {
      OPT_VAR: "",
    },
  });
  expect(env.OPT_VAR).toBeUndefined();
});
