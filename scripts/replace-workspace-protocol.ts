/// <reference types="bun-types" />
export const MODULE = true;

/**
 * Hack to replace the workspace protocol with the actual version
 */
const corePkg = await Bun.file("../core/package.json").json();
const version = corePkg.version;

const cliPkg = await Bun.file("../cli/package.json").json();
cliPkg.dependencies.envin = version;
await Bun.write("../cli/package.json", JSON.stringify(cliPkg, null, 2));
