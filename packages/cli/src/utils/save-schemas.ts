import fs from "node:fs";
import path from "node:path";

export type ExtractedSchema = {
  shared?: Record<string, any>;
  client?: Record<string, any>;
  server?: Record<string, any>;
  clientPrefix?: string;
};

/**
 * Save schema objects to a TypeScript file in the core package
 */
export function saveSchemasToCorePackage(
  schemas: ExtractedSchema,
  outputPath?: string,
): void {
  const defaultOutputPath = path.join(
    process.cwd(),
    "packages/core/src/generated-schemas.ts",
  );

  const filePath = outputPath || defaultOutputPath;

  // Generate TypeScript file content
  const fileContent = `// Auto-generated file - do not edit manually
// Generated from bundled environment schema code

export const generatedSchemas = ${JSON.stringify(schemas, null, 2)} as const;

export type GeneratedSchemaType = typeof generatedSchemas;

// Helper to access individual schema sections
export const getSharedSchemas = () => generatedSchemas.shared || {};
export const getClientSchemas = () => generatedSchemas.client || {};
export const getServerSchemas = () => generatedSchemas.server || {};
export const getClientPrefix = () => generatedSchemas.clientPrefix;

// Re-export for convenience
export default generatedSchemas;
`;

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(filePath, fileContent, "utf-8");

  console.log(`✅ Schemas saved to: ${filePath}`);
}

/**
 * Extract schema objects from bundled code module exports
 */
export function extractSchemasFromModuleExports(
  moduleExports: any,
): ExtractedSchema {
  // Handle different export patterns
  if (moduleExports && typeof moduleExports === "object") {
    // Direct export of schema object
    if (moduleExports.shared || moduleExports.client || moduleExports.server) {
      return {
        shared: moduleExports.shared,
        client: moduleExports.client,
        server: moduleExports.server,
        clientPrefix: moduleExports.clientPrefix,
      };
    }

    // Named export (e.g., { envSchema: { shared: ..., client: ... } })
    const schemaKeys = Object.keys(moduleExports);
    for (const key of schemaKeys) {
      const value = moduleExports[key];
      if (
        value &&
        typeof value === "object" &&
        (value.shared || value.client || value.server)
      ) {
        return {
          shared: value.shared,
          client: value.client,
          server: value.server,
          clientPrefix: value.clientPrefix,
        };
      }
    }

    // Fallback: treat entire moduleExports as schema sections
    return {
      shared: moduleExports.shared,
      client: moduleExports.client,
      server: moduleExports.server,
      clientPrefix: moduleExports.clientPrefix,
    };
  }

  return {};
}

/**
 * Load saved schemas from the core package
 */
export function loadSchemasFromCore(filePath?: string): ExtractedSchema | null {
  const defaultPath = path.join(
    process.cwd(),
    "packages/core/src/generated-schemas.ts",
  );

  const targetPath = filePath || defaultPath;

  if (!fs.existsSync(targetPath)) {
    return null;
  }

  try {
    // For now, we'll read and parse the JSON from the file
    // In a real implementation, you might want to use a proper TypeScript loader
    const content = fs.readFileSync(targetPath, "utf-8");
    const match = content.match(
      /export const generatedSchemas = (.*?) as const;/s,
    );

    if (match) {
      return JSON.parse(match[1]);
    }
  } catch (error) {
    console.error("Failed to load schemas:", error);
  }

  return null;
}
