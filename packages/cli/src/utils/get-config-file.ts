import { type BuildFailure, build, type OutputFile } from "esbuild";
import path from "node:path";
import { runBundledCode } from "./run-bundled-code";
import { isErr } from "@/utils/result";
import { improveErrorWithSourceMap } from "@/utils/improve-error-with-sourcemap";
import { z } from "zod";

const ConfigModule = z.object({
  default: z.record(z.string(), z.unknown()),
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
      external: ["@turbostarter/env"],
    });
    outputFiles = buildData.outputFiles;
  } catch (exception) {
    const buildFailure = exception as BuildFailure;
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
    "../.."
  );
  sourceMapToConfig.sources = sourceMapToConfig.sources.map(source =>
    path.resolve(sourceMapFile?.path ?? "", "..", source)
  );

  const runningResult = runBundledCode(builtConfigFile ?? "", configFilePath);

  if (isErr(runningResult)) {
    const { error } = runningResult;
    if (error instanceof Error) {
      error.stack &&= error.stack.split("at Script.runInContext (node:vm")[0];

      return {
        error: improveErrorWithSourceMap(
          error,
          configFilePath,
          sourceMapToConfig
        ),
      };
    }

    throw error;
  }

  const parseResult = ConfigModule.safeParse(runningResult.value);

  if (parseResult.error) {
    return {
      error: improveErrorWithSourceMap(
        new Error(
          `The config file at ${configFilePath} does not contain the expected exports`,
          {
            cause: parseResult.error,
          }
        ),
        configFilePath,
        sourceMapToConfig
      ),
    };
  }

  const { data: configModule } = parseResult;

  return {
    config: configModule.default,
    sourceMapToOriginalFile: sourceMapToConfig,
  };
};
