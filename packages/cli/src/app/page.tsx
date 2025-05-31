import { Envin } from "@/components/envin";
import { config } from "@/lib/config";
import { getVariables } from "@/lib/variables";

export default async function Home() {
  if (!config) {
    return <p>No config found.</p>;
  }

  const variables = getVariables(config);

  return <Envin variables={variables} />;
}
