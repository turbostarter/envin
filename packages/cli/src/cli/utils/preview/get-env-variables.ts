import path from "node:path";
import { isDev } from "./start-dev-server";

export const getEnvVariablesForPreviewApp = (
  relativePathToEnvDirectory: string,
  cwd: string,
) => {
  return {
    ENV_DIR_RELATIVE_PATH: relativePathToEnvDirectory,
    ENV_DIR_ABSOLUTE_PATH: path.resolve(cwd, relativePathToEnvDirectory),
    USER_PROJECT_LOCATION: cwd,
    NEXT_PUBLIC_IS_PREVIEW_DEVELOPMENT: isDev ? "true" : "false",
  } as const;
};
