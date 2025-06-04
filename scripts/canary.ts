/**
 * Script for bumping the version of the packages to a canary version
 * and then publishing them to NPM
 */
export const MODULE = true;

const packages = ["core", "cli"];

const commitHash = (await Bun.$`git rev-parse --short HEAD`.text()).trim();

for (const pkg of packages) {
  const pkgJson = await Bun.file(`packages/${pkg}/package.json`).json();

  const oldVersion = pkgJson.version;
  const [major, minor, patch] = oldVersion.split(".").map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}-canary.${commitHash}`;

  pkgJson.version = newVersion;
  const content = `${JSON.stringify(pkgJson, null, "\t")}\n`;
  const newContent = content.replace(
    new RegExp(`"envin": "${oldVersion}"`, "g"),
    `"envin": "${newVersion}"`,
  );

  await Bun.write(`packages/${pkg}/package.json`, newContent);

  /**
   * 2. Run prepack (if exists)
   */
  if (pkgJson.scripts?.prepack) {
    await Bun.$`bun run prepack`.cwd(`packages/${pkg}`);
  }

  /**
   * 3. Publish to NPM
   */
  await Bun.$`npm publish --access public --tag canary`.cwd(`packages/${pkg}`);
}
