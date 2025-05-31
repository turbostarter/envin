import path from "node:path";
import { envDirectoryAbsolutePath } from "@/app/env";
import { getConfigFile } from "@/utils/get-config-file";

const envConfigFilePath = path.join(envDirectoryAbsolutePath, "env.config.ts");
export const { config, error } = await getConfigFile(envConfigFilePath);
