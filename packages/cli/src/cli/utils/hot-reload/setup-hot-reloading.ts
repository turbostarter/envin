import { promises as fs } from "node:fs";
import type http from "node:http";
import path from "node:path";
import { watch } from "chokidar";
import debounce from "debounce";
import { type Socket, Server as SocketServer } from "socket.io";
import { logger } from "../../utils/logger";
import { createDependencyGraph } from "./create-dependency-graph";
import type { HotReloadChange } from "./types";

const IGNORED_DIR_NAMES = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
  "tmp",
];

const normalizePath = (p: string) => p.split(path.sep).join("/");

const isPathInIgnoredDir = (p: string) => {
  const normalized = normalizePath(p);
  return IGNORED_DIR_NAMES.some(
    (dir) =>
      normalized.includes(`/${dir}/`) ||
      normalized.endsWith(`/${dir}`) ||
      normalized.startsWith(`${dir}/`),
  );
};

const toDirGlob = (dir: string) => [`**/${dir}/**`, `${dir}/**`];

const readGitignoreGlobs = async (baseDir: string) => {
  try {
    const gitignorePath = path.join(baseDir, ".gitignore");
    const data = await fs.readFile(gitignorePath, "utf8");
    const lines = data.split(/\r?\n/);
    const globs: string[] = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#") || line.startsWith("!")) {
        continue;
      }

      let pattern = line.replace(/^\//, "");
      if (pattern.endsWith("/")) {
        pattern = pattern.slice(0, -1);
        globs.push(`**/${pattern}/**`, `${pattern}/**`);
        continue;
      }

      if (pattern.includes("*") || pattern.includes("?")) {
        globs.push(`**/${pattern}`, pattern);
      } else {
        globs.push(
          `**/${pattern}/**`,
          `${pattern}/**`,
          `**/${pattern}`,
          pattern,
        );
      }
    }
    return globs;
  } catch {
    return [];
  }
};

const buildIgnoredGlobs = async (baseDir: string) => {
  const defaultIgnoredGlobs = IGNORED_DIR_NAMES.flatMap(toDirGlob);
  const gitignoreGlobs = await readGitignoreGlobs(baseDir);
  return [...defaultIgnoredGlobs, ...gitignoreGlobs];
};

const createEnvWatcher = async (baseDir: string) => {
  const ignoredGlobs = await buildIgnoredGlobs(baseDir);
  return watch(["**/*.{js,ts,jsx,tsx,mjs,cjs}"], {
    cwd: baseDir,
    ignoreInitial: true,
    ignored: ignoredGlobs,
    ignorePermissionErrors: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  });
};

const addExternalFilesToWatcher = (
  w: ReturnType<typeof watch>,
  files: string[],
) => {
  for (const p of files) {
    if (!isPathInIgnoredDir(p)) {
      w.add(p);
    }
  }
};

const attachShutdownHandlers = (
  w: ReturnType<typeof watch>,
  verbose: boolean,
) => {
  const exit = async () => {
    if (verbose) {
      logger.info("Stopping file watcher and cleaning up...");
    }
    await w.close();
  };
  process.on("SIGINT", exit);
  process.on("uncaughtException", exit);
};

export const setupHotreloading = async ({
  devServer,
  envDirRelativePath,
  verbose,
}: {
  devServer: http.Server;
  envDirRelativePath: string;
  verbose: boolean;
}) => {
  if (verbose) {
    logger.start("Initializing socket.io server for hot reloading...");
  }

  let clients: Socket[] = [];
  const io = new SocketServer(devServer);

  io.on("connection", (client) => {
    if (verbose) {
      logger.debug("Client connected to hot reload socket");
    }
    clients.push(client);

    client.on("disconnect", () => {
      if (verbose) {
        logger.debug("Client disconnected from hot reload socket");
      }
      clients = clients.filter((item) => item !== client);
    });
  });

  // used to keep track of all changes
  // and send them at once to the preview app through the web socket
  let changes = [] as HotReloadChange[];

  const reload = debounce(() => {
    // we detect these using the useHotreload hook on the Next app
    if (verbose) {
      logger.debug(
        "Emitting reload event to",
        clients.length,
        "clients",
        changes,
      );
    }
    clients.forEach((client) => {
      client.emit(
        "reload",
        changes.filter((change) =>
          // Ensures only changes inside the emails directory are emitted
          path
            .resolve(absolutePathToEnvDirectory, change.filename)
            .startsWith(absolutePathToEnvDirectory),
        ),
      );
    });

    changes = [];
  }, 150);

  const absolutePathToEnvDirectory = path.resolve(
    process.cwd(),
    envDirRelativePath,
  );

  const [dependencyGraph, updateDependencyGraph, { resolveDependentsOf }] =
    await createDependencyGraph(absolutePathToEnvDirectory);
  if (verbose) {
    logger.info("Dependency graph created", {
      modules: Object.keys(dependencyGraph).length,
      root: absolutePathToEnvDirectory,
    });
  }

  const watcher = await createEnvWatcher(absolutePathToEnvDirectory);

  const getFilesOutsideEnvDirectory = () =>
    Object.keys(dependencyGraph).filter((p) =>
      path.relative(absolutePathToEnvDirectory, p).startsWith(".."),
    );
  let filesOutsideEnvDirectory = getFilesOutsideEnvDirectory();
  // adds in to be watched separately all of the files that are outside of
  // the user's env directory
  addExternalFilesToWatcher(watcher, filesOutsideEnvDirectory);

  attachShutdownHandlers(watcher, verbose);

  watcher.on("all", async (event, relativePathToChangeTarget) => {
    if (verbose) {
      logger.debug("File system event", {
        event,
        file: relativePathToChangeTarget,
      });
    }
    const file = relativePathToChangeTarget.split(path.sep);
    if (file.length === 0) {
      return;
    }
    const pathToChangeTarget = path.resolve(
      absolutePathToEnvDirectory,
      relativePathToChangeTarget,
    );

    await updateDependencyGraph(event, pathToChangeTarget);

    const newFilesOutsideEnvDirectory = getFilesOutsideEnvDirectory();
    // the inexistent ones and watching the new ones
    //
    // this is necessary to avoid the issue mentioned here https://github.com/resend/react-email/issues/1433#issuecomment-2177515290
    for (const p of filesOutsideEnvDirectory) {
      if (!newFilesOutsideEnvDirectory.includes(p)) {
        watcher.unwatch(p);
      }
    }
    for (const p of newFilesOutsideEnvDirectory) {
      if (!filesOutsideEnvDirectory.includes(p) && !isPathInIgnoredDir(p)) {
        watcher.add(p);
      }
    }
    filesOutsideEnvDirectory = newFilesOutsideEnvDirectory;

    changes.push({
      event,
      filename: relativePathToChangeTarget,
    });

    // These dependents are dependents resolved recursively, so even dependents of dependents
    // will be notified of this change so that we ensure that things are updated in the preview.
    for (const dependentPath of resolveDependentsOf(pathToChangeTarget)) {
      changes.push({
        event: "change" as const,
        filename: path.relative(absolutePathToEnvDirectory, dependentPath),
      });
    }
    reload();
  });

  return watcher;
};
