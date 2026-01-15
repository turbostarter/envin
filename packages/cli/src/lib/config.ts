import path from "node:path";
import { envConfigPath, envDirectoryAbsolutePath } from "@/app/env";
import { Environment } from "@/lib/types";
import { getConfigFile } from "@/utils/get-config-file";

export const envConfigFilePath =
  envConfigPath || path.join(envDirectoryAbsolutePath ?? "", "env.config.ts");
export const { config, error } = await getConfigFile(envConfigFilePath);

export const FILES = {
  [Environment.DEVELOPMENT]: [
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
  ],
  [Environment.PRODUCTION]: [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
  ],
} as const;
