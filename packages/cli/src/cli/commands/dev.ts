import fs from "node:fs";
import { setupHotreloading } from "../utils/hot-reload/setup-hot-reloading";
import { logger } from "../utils/logger";
import { startDevServer } from "../utils/preview";

interface Args {
  dir: string;
  port: string;
  verbose: boolean;
}

export const dev = async ({ dir: envDirRelativePath, port, verbose }: Args) => {
  try {
    if (verbose) {
      logger.debug("Starting dev command...", {
        cwd: process.cwd(),
        dir: envDirRelativePath,
        port,
      });
    }

    if (!fs.existsSync(envDirRelativePath)) {
      logger.error(`Missing ${envDirRelativePath} folder!`);
      process.exit(1);
    }

    const devServer = await startDevServer({
      envDirRelativePath,
      staticBaseDirRelativePath: envDirRelativePath,
      port: Number.parseInt(port),
      verbose,
    });

    if (verbose) {
      logger.start("Dev server started, setting up hot reloading...");
    }

    await setupHotreloading({
      devServer,
      envDirRelativePath,
      verbose,
    });

    if (verbose) {
      logger.success("Hot reloading setup complete");
    }
  } catch (error) {
    logger.error(new Error("Error while running dev!"), error);
    process.exit(1);
  }
};
