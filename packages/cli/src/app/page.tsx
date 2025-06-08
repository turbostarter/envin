import path from "node:path";
import { Ban } from "lucide-react";
import { Envin } from "@/components/envin";
import { getVariables } from "@/lib/variables";
import { getConfigFile } from "@/utils/get-config-file";
import { envDirectoryAbsolutePath } from "./env";

export const envConfigFilePath = path.join(
  envDirectoryAbsolutePath ?? "",
  "env.config.ts",
);

export default async function Home() {
  const { config } = await getConfigFile(envConfigFilePath);

  if (!config) {
    return (
      <div className="flex grow h-full border-destructive border-dashed border-2 rounded-lg flex-col items-center justify-center">
        <Ban className="size-20 mb-6 text-destructive" />
        <span className="text-2xl font-medium">
          There was an error loading the config.
        </span>
        <p className="text-muted-foreground">
          Please check the config file and try again.
        </p>
      </div>
    );
  }

  const variables = await getVariables(config);

  return <Envin variables={variables} />;
}
