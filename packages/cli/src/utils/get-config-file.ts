"use server";

import path from "node:path";
import { type BuildFailure, build, type OutputFile } from "esbuild";
import * as z from "zod";
import type { Config } from "@/lib/types";
import { improveErrorWithSourceMap } from "@/utils/improve-error-with-sourcemap";
import { isErr } from "@/utils/result";
import { runBundledCode } from "./run-bundled-code";

const presetSchema = z.object({
  id: z.string().optional(),
  clientPrefix: z.string().optional(),
  client: z.record(z.string(), z.unknown()).optional(),
  server: z.record(z.string(), z.unknown()).optional(),
  shared: z.record(z.string(), z.unknown()).optional(),
});

const configSchema = z.object({
  default: z.object({
    options: presetSchema.extend({ extends: z.array(presetSchema).optional() }),
    env: z.record(z.string(), z.unknown()),
  }),
});

export const getConfigFile = async (configFilePath: string) => {
  let outputFiles: OutputFile[];
  try {
    const buildData = await build({
      bundle: true,
      entryPoints: [configFilePath],
      platform: "node",
      write: false,

      format: "cjs",
      jsx: "automatic",
      logLevel: "silent",
      loader: {
        ".js": "jsx",
      },
      outdir: "stdout",
      sourcemap: "external",
      external: ["envin"],
    });
    outputFiles = buildData.outputFiles;
  } catch (exception) {
    const buildFailure = exception as BuildFailure;
    console.error("Build failure:", buildFailure);
    return {
      error: {
        message: buildFailure.message,
        stack: buildFailure.stack,
        name: buildFailure.name,
        cause: buildFailure.cause,
      },
    };
  }

  const sourceMapFile = outputFiles[0];
  const bundledConfigFile = outputFiles[1];
  const builtConfigFile = bundledConfigFile?.text;

  const sourceMapToConfig = JSON.parse(sourceMapFile?.text ?? "");
  // because it will have a path like <tsconfigLocation>/stdout/config.js.map
  sourceMapToConfig.sourceRoot = path.resolve(
    sourceMapFile?.path ?? "",
    "../..",
  );
  sourceMapToConfig.sources = sourceMapToConfig.sources.map((source) =>
    path.resolve(sourceMapFile?.path ?? "", "..", source),
  );

  const runningResult = runBundledCode(builtConfigFile ?? "", configFilePath);

  if (isErr(runningResult)) {
    const { error } = runningResult;
    if (error instanceof Error) {
      error.stack &&= error.stack.split("at Script.runInContext (node:vm")[0];
      console.error("Error running bundled code:", error);

      return {
        error: improveErrorWithSourceMap(
          error,
          configFilePath,
          sourceMapToConfig,
        ),
      };
    }

    console.error("Unknown error running bundled code:", error);
    throw error;
  }

  const parseResult = configSchema.safeParse(runningResult.value.exports);

  if (parseResult.error) {
    console.error("Config schema validation error:", parseResult.error);
    return {
      error: improveErrorWithSourceMap(
        new Error(
          `The config file at ${configFilePath} does not contain the expected exports`,
          {
            cause: parseResult.error,
          },
        ),
        configFilePath,
        sourceMapToConfig,
      ),
    };
  }

  const { data: configModule } = parseResult;

  return {
    config: configModule.default as Config,
    sourceMapToOriginalFile: sourceMapToConfig,
  };
};
