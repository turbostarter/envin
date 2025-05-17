import { defineEnv } from "envin";
import { z } from "zod";

export default defineEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: z
      .string()
      .url()
      .describe("The URL of the API endpoint."),
  },
  server: {
    SERVER_NUMBER: z
      .literal(1)
      .describe(
        "The unique number identifying the server (must be 1 for this configuration).",
      ),
    SERVER_NAME: z
      .literal("Server 1")
      .describe(
        "The human-readable name of the server (must be 'Server 1' for this configuration).",
      ),
  },
  shared: {
    NODE_ENV: z
      .enum(["development", "production"])
      .default("development")
      .describe(
        "Specifies the application environment (development or production). Defaults to 'development'.",
      ),
    IS_TEST: z
      .string()
      .default("false")
      .describe(
        "Flag indicating if the application is running in a test environment. Defaults to 'false'.",
      ),
  },
});
