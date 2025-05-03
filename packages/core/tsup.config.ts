import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  minify: true,
  sourcemap: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "esnext",
  outDir: "dist",
});
