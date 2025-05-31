import path from "node:path";
import vm from "node:vm";
import * as env from "envin";
import * as envPresets from "envin/presets/zod";
import { err, ok, type Result } from "./result";
import { staticNodeModulesForVM } from "./static-node-modules-for-vm";

const mockDefineEnv = (options) => {
  return {
    options,
    env: env.defineEnv({
      ...options,
      skip: true,
    }),
  };
};

const internalModules = {
  envin: {
    ...env,
    defineEnv: mockDefineEnv,
  },
  "envin/presets/zod": envPresets,
} as const;

export const runBundledCode = (
  code: string,
  filename: string,
): Result<{ exports: unknown }, unknown> => {
  const fakeContext = {
    ...global,
    console,
    Buffer,
    AbortSignal,
    Event,
    EventTarget,
    TextDecoder,
    Request,
    Response,
    TextDecoderStream,
    TextEncoder,
    TextEncoderStream,
    ReadableStream,
    URL,
    URLSearchParams,
    Headers,
    module: {
      exports: {},
    },
    __filename: filename,
    __dirname: path.dirname(filename),
    require: (specifiedModule: string) => {
      let m = specifiedModule;
      if (specifiedModule.startsWith("node:")) {
        m = m.split(":")[1] ?? "";
      }

      if (m in internalModules) {
        return internalModules[m];
      }

      if (m in staticNodeModulesForVM) {
        return staticNodeModulesForVM[m];
      }

      return require(`${specifiedModule}`) as unknown;
      // this stupid string templating was necessary to not have
      // webpack warnings like:
      //
      // Import trace for requested module:
      // ./src/utils/run-bundled-code.ts
      // ./src/app/page.tsx
      //  ⚠ ./src/utils/run-bundled-code.ts
      // Critical dependency: the request of a dependency is an expression
    },
    process,
  };

  try {
    vm.runInNewContext(code, fakeContext, { filename });
  } catch (exception) {
    return err(exception);
  }

  const moduleExports = fakeContext.module.exports as unknown;

  return ok({
    exports: moduleExports,
  });
};
