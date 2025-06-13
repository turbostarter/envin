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
  const { config, error } = await getConfigFile(envConfigFilePath);

  if (!config || error) {
    return (
      <div className="flex grow h-full border-destructive border-dashed border-2 rounded-lg flex-col items-center justify-center">
        <Ban className="size-20 mb-6 text-destructive" />
        {error.name && (
          <code className="text-muted-foreground bg-muted py-0.5 px-2.5 rounded-md mb-2">
            {error.name}
          </code>
        )}
        <span className="text-2xl font-medium">
          There was an error loading the config.
        </span>
        <p className="text-muted-foreground">
          {error?.message ?? "Please check the config file and try again."}
        </p>

        {error.stack && (
          <pre className="text-muted-foreground bg-muted py-4 px-6 max-w-4xl mt-6 rounded-md overflow-x-auto">
            {error.stack}
          </pre>
        )}
      </div>
    );
  }

  const variables = await getVariables(config);

  return <Envin variables={variables} />;
}
