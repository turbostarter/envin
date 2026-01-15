import path from "node:path";
import { isDev } from "./start-dev-server";

export const getEnvVariablesForPreviewApp = (
  relativePathToEnvDirectory: string,
  cwd: string,
  envDirAbsolutePaths: string[],
  envFilePaths: string[],
  envConfigPath: string,
) => {
  return {
    ENV_DIR_RELATIVE_PATH: relativePathToEnvDirectory,
    ENV_DIR_ABSOLUTE_PATH: path.resolve(cwd, relativePathToEnvDirectory),
    ENV_DIR_ABSOLUTE_PATHS: JSON.stringify(envDirAbsolutePaths),
    ENV_FILE_PATHS: JSON.stringify(envFilePaths),
    ENV_CONFIG_PATH: envConfigPath,
    USER_PROJECT_LOCATION: cwd,
    NEXT_PUBLIC_IS_PREVIEW_DEVELOPMENT: isDev ? "true" : "false",
  } as const;
};
