/// <reference types="bun-types" />
export const MODULE = true;

const packages = ["core", "cli"];

/**
 * Hack to populate the README from root to packages
 */
const rootReadme = await Bun.file("../../README.md").text();

for (const pkg of packages) {
  await Bun.write(`../${pkg}/README.md`, rootReadme);
}
