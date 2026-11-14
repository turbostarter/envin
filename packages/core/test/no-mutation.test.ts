import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { z } from "zod/v4";
import { defineEnv } from "../src";

describe("defineEnv does not mutate its input", () => {
  describe("process.env (no env / envStrict passed)", () => {
    const original = { ...process.env };

    beforeEach(() => {
      process.env.EMPTY_IN_SCHEMA = "";
      process.env.EMPTY_NOT_IN_SCHEMA = "";
      process.env.NON_EMPTY = "value";
    });

    afterEach(() => {
      for (const key of Object.keys(process.env)) {
        if (!(key in original)) delete process.env[key];
      }
      Object.assign(process.env, original);
    });

    test("keeps empty variables in process.env", () => {
      defineEnv({
        server: { EMPTY_IN_SCHEMA: z.string().optional() },
      });

      expect(process.env.EMPTY_IN_SCHEMA).toBe("");
      expect(process.env.EMPTY_NOT_IN_SCHEMA).toBe("");
      expect("EMPTY_NOT_IN_SCHEMA" in process.env).toBe(true);
      expect(process.env.NON_EMPTY).toBe("value");
    });

    test("still treats empty process.env values as missing", () => {
      const env = defineEnv({
        server: { EMPTY_IN_SCHEMA: z.string().default("fallback") },
      });
      expect(env.EMPTY_IN_SCHEMA).toBe("fallback");

      expect(() =>
        defineEnv({
          server: { EMPTY_IN_SCHEMA: z.string() },
          onError: () => {
            throw new Error("invalid");
          },
        }),
      ).toThrow("invalid");
    });

    test("keeps process.env intact when validation fails", () => {
      expect(() =>
        defineEnv({
          server: { EMPTY_IN_SCHEMA: z.string() },
          onError: () => {
            throw new Error("invalid");
          },
        }),
      ).toThrow("invalid");

      expect(process.env.EMPTY_IN_SCHEMA).toBe("");
    });

    test("keeps process.env intact with skip: true", () => {
      defineEnv({
        server: { EMPTY_IN_SCHEMA: z.string().optional() },
        skip: true,
      });

      expect(process.env.EMPTY_IN_SCHEMA).toBe("");
      expect(process.env.EMPTY_NOT_IN_SCHEMA).toBe("");
    });
  });

  describe.each(["env", "envStrict"] as const)("%s option", (option) => {
    test("does not mutate the passed object", () => {
      const input = { PORT: "3000", OTHER: "", OPT: "" };
      const snapshot = { ...input };

      const env = defineEnv({
        server: { PORT: z.string(), OPT: z.string().optional() },
        [option]: input,
      });

      expect(input).toEqual(snapshot);
      expect("OTHER" in input).toBe(true);
      expect(env.PORT).toBe("3000");
      expect(env.OPT).toBeUndefined();
    });

    test("works with a frozen object containing empty strings", () => {
      const input = Object.freeze({ PORT: "3000", OTHER: "" });

      const env = defineEnv({
        server: { PORT: z.string() },
        [option]: input,
      });

      expect(env.PORT).toBe("3000");
      expect(input).toEqual({ PORT: "3000", OTHER: "" });
    });

    test("works with a deeply frozen / sealed object", () => {
      const input = Object.seal(Object.freeze({ PORT: "3000", EMPTY: "" }));

      expect(() =>
        defineEnv({ server: { PORT: z.string() }, [option]: input }),
      ).not.toThrow();
    });

    test("empty strings are still treated as missing", () => {
      const input = Object.freeze({ REQ: "" });

      expect(() =>
        defineEnv({
          server: { REQ: z.string() },
          [option]: input,
          onError: () => {
            throw new Error("invalid");
          },
        }),
      ).toThrow("invalid");
    });

    test("empty strings fall back to schema defaults", () => {
      const input = Object.freeze({ PORT: "" });

      const env = defineEnv({
        server: { PORT: z.string().default("3000") },
        [option]: input,
      });

      expect(env.PORT).toBe("3000");
    });

    test("skip: true neither mutates nor throws on frozen input", () => {
      const input = Object.freeze({ PORT: "", OTHER: "x" });

      const env = defineEnv({
        server: { PORT: z.string().default("3000") },
        [option]: input,
        skip: true,
      });

      expect(env.PORT).toBe("3000");
      expect(input).toEqual({ PORT: "", OTHER: "x" });
    });

    test("can be called repeatedly with the same object", () => {
      const input = Object.freeze({ PORT: "3000", OTHER: "" });
      const options = { server: { PORT: z.string() }, [option]: input };

      const first = defineEnv(options);
      const second = defineEnv(options);

      expect(first.PORT).toBe("3000");
      expect(second.PORT).toBe("3000");
    });

    test("preserves empty strings inside nested presets/extends usage", () => {
      const input = { A: "", B: "b" };
      const preset = {
        id: "preset",
        server: { A: z.string().optional(), B: z.string() },
      };

      const env = defineEnv({
        extends: [preset],
        [option]: input,
      });

      expect(env.A).toBeUndefined();
      expect(env.B).toBe("b");
      expect(input).toEqual({ A: "", B: "b" });
    });
  });
});
