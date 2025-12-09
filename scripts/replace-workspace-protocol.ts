/// <reference types="bun-types" />
export const MODULE = true;

/**
 * Replace the workspace protocol with the actual version
 */
const corePkg = await Bun.file("../core/package.json").json();
const version = corePkg.version;

const cliPkg = await Bun.file("../cli/package.json").json();
cliPkg.dependencies.envin = version;

/**
 * Replace the catalog protocol with the actual version
 */
const rootPkg = await Bun.file("../../package.json").json();
const catalog = rootPkg.catalog;

const replaceCatalogInDeps = (
  deps: Record<string, string> | undefined,
): Record<string, string> | undefined => {
  if (!deps) return deps;

  return Object.fromEntries(
    Object.entries(deps).map(([name, version]) => {
      if (version === "catalog:") {
        const catalogVersion = catalog[name];
        if (!catalogVersion) {
          throw new Error(`Missing catalog entry for ${name}`);
        }
        return [name, catalogVersion];
      }
      return [name, version];
    }),
  );
};

cliPkg.dependencies = replaceCatalogInDeps(cliPkg.dependencies);
cliPkg.devDependencies = replaceCatalogInDeps(cliPkg.devDependencies);
await Bun.write("../cli/package.json", JSON.stringify(cliPkg, null, 2));

corePkg.dependencies = replaceCatalogInDeps(corePkg.dependencies);
corePkg.devDependencies = replaceCatalogInDeps(corePkg.devDependencies);
await Bun.write("../core/package.json", JSON.stringify(corePkg, null, 2));
