import path from "node:path";
import { envDirectoryAbsolutePath } from "@/app/env";
import { Environment } from "@/lib/types";
import { getConfigFile } from "@/utils/get-config-file";

export const envConfigFilePath = path.join(
  envDirectoryAbsolutePath ?? "",
  "env.config.ts",
);
export const { config, error } = await getConfigFile(envConfigFilePath);

export const FILES = {
  [Environment.DEVELOPMENT]: [".env", ".env.development", ".env.local"],
  [Environment.PRODUCTION]: [
    ".env",
    ".env.production",
    ".env.local",
    ".env.production.local",
  ],
} as const;
