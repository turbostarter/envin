import fs from "node:fs";
import path from "node:path";
import { setupHotreloading } from "../utils/hot-reload/setup-hot-reloading";
import { logger } from "../utils/logger";
import { startDevServer } from "../utils/preview";

interface Args {
  dir: string;
  config?: string;
  env?: string;
  cascade?: boolean;
  port: string;
  verbose: boolean;
}

const WORKSPACE_ROOT_FILE_MARKERS = [
  "pnpm-workspace.yaml",
  "turbo.json",
  "nx.json",
  "lerna.json",
  "rush.json",
  "WORKSPACE",
  "WORKSPACE.bazel",
];

const findWorkspaceRoot = (startDir: string) => {
  const readPackageJson = (candidateDir: string) => {
    try {
      const packageJsonPath = path.join(candidateDir, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        return null;
      }
      const raw = fs.readFileSync(packageJsonPath, "utf8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const hasWorkspacePackageJson = (candidateDir: string) => {
    const parsed = readPackageJson(candidateDir);
    return Boolean(parsed?.workspaces);
  };

  const hasWorkspaceMarkers = (candidateDir: string) =>
    WORKSPACE_ROOT_FILE_MARKERS.some((marker) =>
      fs.existsSync(path.join(candidateDir, marker)),
    ) || hasWorkspacePackageJson(candidateDir);

  const hasMonorepoFolderHints = (candidateDir: string) => {
    const hasApps = fs.existsSync(path.join(candidateDir, "apps"));
    const hasPackages = fs.existsSync(path.join(candidateDir, "packages"));
    const packageJson = readPackageJson(candidateDir);
    return (hasApps || hasPackages) && Boolean(packageJson?.private ?? false);
  };

  let currentDir = startDir;
  let bestCandidate: string | null = null;

  while (true) {
    if (hasWorkspaceMarkers(currentDir)) {
      return currentDir;
    }
    if (hasMonorepoFolderHints(currentDir)) {
      bestCandidate = currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (
      parentDir === currentDir ||
      fs.existsSync(path.join(currentDir, ".git")) ||
      fs.existsSync(path.join(currentDir, "node_modules"))
    ) {
      return bestCandidate ?? startDir;
    }
    currentDir = parentDir;
  }
};

const uniquePaths = (paths: string[]) => {
  const seen = new Set<string>();
  return paths.filter((candidate) => {
    const normalized = path.normalize(candidate);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

export const dev = async ({
  dir: envDirRelativePath,
  config,
  env,
  cascade = false,
  port,
  verbose,
}: Args) => {
  try {
    if (verbose) {
      logger.debug("Starting dev command...", {
        cwd: process.cwd(),
        dir: envDirRelativePath,
        config,
        env,
        cascade,
        port,
      });
    }

    const cwd = process.cwd();
    const resolveFromCwd = (targetPath: string) =>
      path.isAbsolute(targetPath) ? targetPath : path.resolve(cwd, targetPath);

    const workspaceRoot = findWorkspaceRoot(cwd);
    let envFilePaths: string[] = [];
    let envDirPaths: string[] = [];
    let primaryEnvDir = cwd;

    if (env) {
      const resolvedEnvPath = resolveFromCwd(env);
      if (!fs.existsSync(resolvedEnvPath)) {
        logger.error(`Missing ${resolvedEnvPath} path!`);
        process.exit(1);
      }
      const stats = fs.statSync(resolvedEnvPath);
      if (stats.isFile()) {
        envFilePaths = [resolvedEnvPath];
        primaryEnvDir = path.dirname(resolvedEnvPath);
      } else {
        envDirPaths = [resolvedEnvPath];
        primaryEnvDir = resolvedEnvPath;
      }
    } else if (cascade) {
      envDirPaths = uniquePaths([workspaceRoot, cwd]);
      primaryEnvDir = envDirPaths[envDirPaths.length - 1] ?? cwd;
    } else {
      const resolvedDir = resolveFromCwd(envDirRelativePath);
      envDirPaths = [resolvedDir];
      primaryEnvDir = resolvedDir;
    }

    const resolvedEnvDirRelativePath = path.relative(cwd, primaryEnvDir) || ".";

    if (!fs.existsSync(primaryEnvDir)) {
      logger.error(`Missing ${primaryEnvDir} folder!`);
      process.exit(1);
    }

    const resolveConfigPath = () => {
      if (config) {
        return resolveFromCwd(config);
      }

      if (!cascade) {
        return path.join(primaryEnvDir, "env.config.ts");
      }

      const candidates = uniquePaths([
        path.join(primaryEnvDir, "env.config.ts"),
        path.join(workspaceRoot, "env.config.ts"),
      ]);
      return candidates.find((candidate) => fs.existsSync(candidate));
    };

    const resolvedConfigPath = resolveConfigPath();
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
