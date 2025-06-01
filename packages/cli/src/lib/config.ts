import path from "node:path";
import { envDirectoryAbsolutePath } from "@/app/env";
import { Environment } from "@/components/filters/context";
import { getConfigFile } from "@/utils/get-config-file";

const envConfigFilePath = path.join(envDirectoryAbsolutePath, "env.config.ts");
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
