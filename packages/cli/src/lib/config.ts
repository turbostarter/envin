import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { envDirectoryAbsolutePath } from "@/app/env";
import { Environment } from "@/lib/types";
import { getConfigFile } from "@/utils/get-config-file";

const envConfigFilePath = path.join(
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

export const files = Object.fromEntries(
  Object.entries(FILES).map(([environment, files]) => [
    environment,
    files.map((file) => {
      try {
        return parse(
          readFileSync(path.join(envDirectoryAbsolutePath ?? "", file), "utf8"),
        );
      } catch {
        return {};
      }
    }),
  ]),
);
