import fs from "node:fs";
import path from "node:path";
import { setupHotreloading } from "../utils/hot-reload/setup-hot-reloading";
import { logger } from "../utils/logger";
import { startDevServer } from "../utils/preview";

interface Args {
  config?: string;
  env?: string[] | string;
  port: string;
  verbose: boolean;
}

export const dev = async ({ config, env, port, verbose }: Args) => {
  try {
    if (verbose) {
      logger.debug("Starting dev command...", {
        cwd: process.cwd(),
        config,
        env,
        port,
      });
    }

    const cwd = process.cwd();
    const resolveFromCwd = (targetPath: string) =>
      path.isAbsolute(targetPath) ? targetPath : path.resolve(cwd, targetPath);

    let envFilePaths: string[] = [];
    let envDirPaths: string[] = [];
    let primaryEnvDir = cwd;

    if (env && env.length > 0) {
      const envPaths = Array.isArray(env) ? env : [env];
      const resolvedEnvPaths = envPaths.map(resolveFromCwd);

      const missingPath = resolvedEnvPaths.find(
        (resolvedEnvPath) => !fs.existsSync(resolvedEnvPath),
      );
      if (missingPath) {
        logger.error(`Missing ${missingPath} path!`);
        process.exit(1);
      }

      const directories = resolvedEnvPaths.filter((resolvedEnvPath) =>
        fs.statSync(resolvedEnvPath).isDirectory(),
      );
      const files = resolvedEnvPaths.filter(
        (resolvedEnvPath) => !fs.statSync(resolvedEnvPath).isDirectory(),
      );

      if (directories.length > 0 && files.length > 0) {
        logger.error(
          "Multiple --env paths must be all files or all directories.",
        );
        process.exit(1);
      }

      if (directories.length > 0) {
        envDirPaths = directories;
        primaryEnvDir = directories[directories.length - 1] ?? cwd;
      } else {
        envFilePaths = files;
        primaryEnvDir = path.dirname(files[0] ?? cwd);
      }
    } else {
      envDirPaths = [cwd];
      primaryEnvDir = cwd;
    }

    const resolvedEnvDirRelativePath = path.relative(cwd, primaryEnvDir) || ".";

    if (!fs.existsSync(primaryEnvDir)) {
      logger.error(`Missing ${primaryEnvDir} folder!`);
      process.exit(1);
    }

    const resolvedConfigPath = config
      ? resolveFromCwd(config)
      : path.join(cwd, "env.config.ts");
    if (!resolvedConfigPath || !fs.existsSync(resolvedConfigPath)) {
      logger.error("Missing env.config.ts file!");
      process.exit(1);
    }

    const devServer = await startDevServer({
      envDirRelativePath: resolvedEnvDirRelativePath,
      staticBaseDirRelativePath: resolvedEnvDirRelativePath,
      envDirAbsolutePaths: envDirPaths.length ? envDirPaths : [primaryEnvDir],
      envFilePaths,
      envConfigPath: resolvedConfigPath,
      port: Number.parseInt(port),
      verbose,
    });

    if (verbose) {
      logger.start("Dev server started, setting up hot reloading...");
    }

    await setupHotreloading({
      devServer,
      envDirRelativePath: resolvedEnvDirRelativePath,
      envDirAbsolutePaths: envDirPaths.length ? envDirPaths : [primaryEnvDir],
      envFilePaths,
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
