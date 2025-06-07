import fs from "node:fs";
import { setupHotreloading, startDevServer } from "../utils";

interface Args {
  dir: string;
  port: string;
}

export const dev = async ({ dir: envDirRelativePath, port }: Args) => {
  try {
    if (!fs.existsSync(envDirRelativePath)) {
      console.error(`Missing ${envDirRelativePath} folder`);
      process.exit(1);
    }

    const devServer = await startDevServer(
      envDirRelativePath,
      envDirRelativePath,
      Number.parseInt(port),
    );

    await setupHotreloading(devServer, envDirRelativePath);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
