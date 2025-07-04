import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextBuildProcess = spawn("bun", ["next", "build"], {
  detached: true,
  shell: true,
  stdio: "inherit",
  cwd: path.resolve(dirname, "../"),
});

process.on("SIGINT", () => {
  nextBuildProcess.kill("SIGINT");
});

nextBuildProcess.on("exit", (code) => {
  if (code !== 0) {
    console.error(`next build failed with exit code ${code}`);
    process.exit(code);
  }

  const builtPreviewPath = path.resolve(dirname, "../dist/preview");

  if (fs.existsSync(builtPreviewPath)) {
    fs.rmSync(builtPreviewPath, { recursive: true });
  }
  fs.mkdirSync(builtPreviewPath, { recursive: true });
  fs.rmSync(".next/cache", { recursive: true });
  fs.renameSync(".next", path.join(builtPreviewPath, "/.next"));
});
