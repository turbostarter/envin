import path from "node:path";
import vm from "node:vm";
import * as env from "envin";
import * as envPresets from "envin/presets/zod";
import { err, ok, type Result } from "./result";
import { staticNodeModulesForVM } from "./static-node-modules-for-vm";
import {
  saveSchemasToCorePackage,
  extractSchemasFromModuleExports,
  type ExtractedSchema,
} from "./save-schemas";

const mockDefineEnv = (args) => {
  return {
    args,
    env: env.defineEnv({
      ...args,
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
  options?: {
    saveSchemas?: boolean;
    schemaOutputPath?: string;
  },
): Result<{ exports: unknown; schemas?: ExtractedSchema }, unknown> => {
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

  const moduleExports = fakeContext.module.exports as unknown;

  // Extract and optionally save schemas
  let extractedSchemas: ExtractedSchema | undefined;

  if (options?.saveSchemas) {
    extractedSchemas = extractSchemasFromModuleExports(moduleExports);

    if (extractedSchemas && Object.keys(extractedSchemas).length > 0) {
      try {
        saveSchemasToCorePackage(extractedSchemas, options.schemaOutputPath);
        console.log("📋 Environment schemas extracted and saved");
      } catch (error) {
        console.warn("⚠️ Failed to save schemas:", error);
      }
    }
  }

  return ok({
    exports: moduleExports,
    schemas: extractedSchemas,
  });
};
