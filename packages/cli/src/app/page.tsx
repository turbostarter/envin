import { Ban } from "lucide-react";
import { Envin } from "@/components/envin";
import { config } from "@/lib/config";
import { getVariables } from "@/lib/variables";

export default async function Home() {
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

  const variables = await getVariables();

  return <Envin variables={variables} />;
}
