import type http from "node:http";
import path from "node:path";
import { watch } from "chokidar";
import debounce from "debounce";
import { type Socket, Server as SocketServer } from "socket.io";
import { createDependencyGraph } from "./create-dependency-graph";
import type { HotReloadChange } from "./types";

export const setupHotreloading = async (
  devServer: http.Server,
  envDirRelativePath: string,
) => {
  let clients: Socket[] = [];
  const io = new SocketServer(devServer);

  io.on("connection", (client) => {
    clients.push(client);

    client.on("disconnect", () => {
      clients = clients.filter((item) => item !== client);
    });
  });

  // used to keep track of all changes
  // and send them at once to the preview app through the web socket
  let changes = [] as HotReloadChange[];

  const reload = debounce(() => {
    // we detect these using the useHotreload hook on the Next app
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

  console.log("absolutePathToEnvDirectory", absolutePathToEnvDirectory);

  const [dependencyGraph, updateDependencyGraph, { resolveDependentsOf }] =
    await createDependencyGraph(absolutePathToEnvDirectory);

  const watcher = watch("", {
    ignoreInitial: true,
    cwd: absolutePathToEnvDirectory,
  });

  const getFilesOutsideEnvDirectory = () =>
    Object.keys(dependencyGraph).filter((p) =>
      path.relative(absolutePathToEnvDirectory, p).startsWith(".."),
    );
  let filesOutsideEnvDirectory = getFilesOutsideEnvDirectory();
  // adds in to be watched separately all of the files that are outside of
  // the user's env directory
  for (const p of filesOutsideEnvDirectory) {
    watcher.add(p);
  }

  const exit = async () => {
    await watcher.close();
  };
  process.on("SIGINT", exit);
  process.on("uncaughtException", exit);

  watcher.on("all", async (event, relativePathToChangeTarget) => {
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
      if (!filesOutsideEnvDirectory.includes(p)) {
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
