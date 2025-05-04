import path from "node:path";
import vm from "node:vm";
import { err, ok, type Result } from "./result";
import { staticNodeModulesForVM } from "./static-node-modules-for-vm";
import * as env from "@turbostarter/env";
import * as envPresets from "@turbostarter/env/presets";

const mockDefineEnv = arg => {
  return env.defineEnv({
    ...arg,
    skip: true,
  });
};

const internalModules = {
  "@turbostarter/env": {
    ...env,
    defineEnv: mockDefineEnv,
  },
  "@turbostarter/env/presets": envPresets,
} as const;

export const runBundledCode = (
  code: string,
  filename: string
): Result<unknown, unknown> => {
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
      // ./src/utils/get-email-component.tsx
      // ./src/app/page.tsx
      //  ⚠ ./src/utils/get-email-component.tsx
      // Critical dependency: the request of a dependency is an expression
    },
    process,
  };

  try {
    vm.runInNewContext(code, fakeContext, { filename });
  } catch (exception) {
    return err(exception);
  }

  return ok(fakeContext.module.exports as unknown);
};
