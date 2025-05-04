import Image from "next/image";
import path from "node:path";
import fs from "node:fs";
import { envDirectoryAbsolutePath } from "./env";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { zodToJsonSchema } from "zod-to-json-schema";

import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { getConfigFile } from "@/utils/get-config-file";
import { EnvVariablesForm } from "@/components/env-variables-form";
import { validate } from "@/lib/validate";

export default async function Home() {
  const envConfigFilePath = path.join(
    envDirectoryAbsolutePath,
    "env.config.ts",
  );

  const { config } = await getConfigFile(envConfigFilePath);

  return (
    <div className="flex flex-col grow gap-4 py-6 px-8">
      <header>
        <h1 className="text-2xl font-bold">TurboStarter Env</h1>
        <p className="text-sm text-muted-foreground">
          Manage environment variables for your project. Validate and set them
          up in seconds.
        </p>
      </header>
      <main className="flex flex-col gap-6 grow">
        <div className="flex gap-2">
          <Select defaultValue="Production">
            <SelectTrigger>
              <SelectValue placeholder="Select an environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="Valid">
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Valid">Valid</SelectItem>
              <SelectItem value="Invalid">Invalid</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Search for a variable..." />
          <Button variant="outline">
            <Copy className="size-4" />
            Copy to clipboard
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 grow">
          <div className="w-full h-full border rounded-md py-4 px-6">
            <EnvVariablesForm
              schema={zodToJsonSchema(config?._schema, {
                errorMessages: true,
                markdownDescription: true,
                rejectedAdditionalProperties: undefined,
                $refStrategy: "seen",
              })}
            />
          </div>
          <div className="w-full h-full border bg-muted rounded-md"></div>
        </div>
      </main>
    </div>
  );
}
