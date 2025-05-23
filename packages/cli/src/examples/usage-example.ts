/**
 * Example of how to use the schema saving system
 */

import { runBundledCode } from "@/utils/run-bundled-code";
import { loadSchemasFromCore } from "@/utils/save-schemas";

// Example 1: Running bundled code and saving schemas
export async function exampleRunAndSaveSchemas() {
  const exampleCode = `
    const { z } = require('zod');
    
    const envSchema = {
      shared: {
        NODE_ENV: z.enum(['development', 'production', 'test']),
        LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
      },
      client: {
        NEXT_PUBLIC_API_URL: z.string().url(),
        NEXT_PUBLIC_SITE_NAME: z.string().min(1),
      },
      server: {
        DATABASE_URL: z.string().url(),
        JWT_SECRET: z.string().min(32),
        SMTP_HOST: z.string().optional(),
      },
      clientPrefix: 'NEXT_PUBLIC_',
    };
    
    module.exports = envSchema;
  `;

  // Run the code and save schemas
  const result = runBundledCode(exampleCode, "env.config.js", {
    saveSchemas: true,
  });

  if (result.success) {
    console.log("✅ Code executed successfully");
    console.log("📋 Schemas extracted:", result.data.schemas);
    return result.data.schemas;
  } else {
    console.error("❌ Code execution failed:", result.error);
    return null;
  }
}

// Example 2: Loading saved schemas for use in forms
export function exampleLoadSchemasForForm() {
  const schemas = loadSchemasFromCore();

  if (schemas) {
    console.log("✅ Loaded schemas from core package:");
    console.log("Shared fields:", Object.keys(schemas.shared || {}));
    console.log("Client fields:", Object.keys(schemas.client || {}));
    console.log("Server fields:", Object.keys(schemas.server || {}));
    console.log("Client prefix:", schemas.clientPrefix);

    return schemas;
  } else {
    console.log("❌ No schemas found in core package");
    return null;
  }
}

// Example 3: Complete workflow
export async function exampleCompleteWorkflow() {
  console.log("🚀 Starting complete schema workflow...");

  // Step 1: Run environment configuration code
  console.log("\n1. Running environment configuration code...");
  const schemas = await exampleRunAndSaveSchemas();

  if (!schemas) {
    console.log("❌ Failed to extract schemas");
    return;
  }

  // Step 2: Load schemas for form generation
  console.log("\n2. Loading schemas for form generation...");
  const loadedSchemas = exampleLoadSchemasForForm();

  if (!loadedSchemas) {
    console.log("❌ Failed to load schemas");
    return;
  }

  // Step 3: Schemas are now available for form generation
  console.log("\n3. ✅ Schemas ready for form generation!");
  console.log("You can now use SchemaBasedForm component with these schemas");

  return loadedSchemas;
}

// Example 4: Usage in a React component (pseudo-code)
export const exampleReactUsage = `
import React from 'react';
import { SchemaBasedForm } from '@/components/schema-based-form';
import { loadSchemasFromCore } from '@/utils/save-schemas';

export function MyEnvironmentForm() {
  const [schemas, setSchemas] = React.useState(null);
  
  React.useEffect(() => {
    // Load schemas that were saved by running bundled code
    const savedSchemas = loadSchemasFromCore();
    setSchemas(savedSchemas);
  }, []);
  
  if (!schemas) {
    return <div>No schemas available. Please run your environment configuration.</div>;
  }
  
  return (
    <SchemaBasedForm
      schemas={schemas}
      onSubmit={(data) => {
        console.log('Environment variables:', data);
        // Save to .env files or send to server
      }}
      defaultValues={{
        NODE_ENV: 'development',
        LOG_LEVEL: 'info',
      }}
    />
  );
}
`;

// Export for use in CLI commands or tests
export {
  exampleRunAndSaveSchemas,
  exampleLoadSchemasForForm,
  exampleCompleteWorkflow,
};
