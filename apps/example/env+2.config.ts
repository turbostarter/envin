import { defineEnv } from "envin";
import { vercel } from "envin/presets/zod";
import { z } from "zod";

export default defineEnv({
  extends: [vercel],
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: z
      .string()
      .url()
      .describe("The URL of the API endpoint."),
  },
  server: {
    SERVER_NUMBER: z.coerce
      .number()
      .min(10)
      .describe(
        "The unique number identifying the server (must be 1 for this configuration).",
      ),
    SERVER_NAME: z.literal("Server 1"),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    IS_TEST: z
      .string()
      .default("false")
      .describe(
        "Flag indicating if the application is running in a test environment. Defaults to 'false'.",
      ),
  },
});
