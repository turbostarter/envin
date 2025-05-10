import path from "node:path";
import { envDirectoryAbsolutePath } from "./env";

import { zodToJsonSchema } from "zod-to-json-schema";

import { Preview } from "@/components/preview";
import { getConfigFile } from "@/utils/get-config-file";

export default async function Home() {
  const envConfigFilePath = path.join(
    envDirectoryAbsolutePath,
    "env.config.ts",
  );

  const { config } = await getConfigFile(envConfigFilePath);

  return (
    <div className="flex flex-col grow gap-4 py-6 px-8">
      <header className="flex items-center gap-4">
        <div className="size-11 bg-primary rounded-md" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">TurboStarter Env</h1>
          <p className="text-sm text-muted-foreground">
            Manage environment variables for your project. Validate and set them
            up in seconds.
          </p>
        </div>
      </header>
      <main className="flex flex-col gap-4 grow">
        <Preview
          schema={zodToJsonSchema(config?._schema, {
            errorMessages: true,
            markdownDescription: true,
            rejectedAdditionalProperties: undefined,
            $refStrategy: "seen",
          })}
        />
      </main>
    </div>
  );
}
