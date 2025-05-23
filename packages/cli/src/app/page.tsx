import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Preview } from "@/components/preview";
import { getConfigFile } from "@/utils/get-config-file";
import { envDirectoryAbsolutePath } from "./env";
import { Shrub } from "lucide-react";

export default async function Home() {
  const envConfigFilePath = path.join(
    envDirectoryAbsolutePath,
    "env.config.ts",
  );

  const { config } = await getConfigFile(envConfigFilePath);

  console.log(process.cwd);

  return (
    <div className="flex flex-col h-full gap-4 py-6 px-8">
      <header className="flex items-center gap-3">
        <Shrub className="size-11 text-primary" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Envin</h1>
          <p className="text-sm text-muted-foreground">
            Manage environment variables for your project. Validate and set them
            up in seconds.
          </p>
        </div>
      </header>
      <main className="flex flex-col gap-4 min-h-0 h-full">
        <Preview config={config} />
      </main>
    </div>
  );
}
