import { defineEnv } from "envin";
import * as v from "valibot";

export default defineEnv({
  // extends: [vercel],
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: v.pipe(
      v.string(),
      v.url(),
      v.description("The URL of the API endpoint."),
    ),
  },
  server: {
    SERVER_NUMBER: v.pipe(
      v.string(),
      v.transform(Number),
      v.number(),
      v.minValue(10),
      v.description(
        "The unique number identifying the server (must be 1 for this configuration).",
      ),
    ),
    SERVER_NAME: v.literal("Server 1"),
  },
  shared: {
    NODE_ENV: v.optional(
      v.pipe(
        v.picklist(["development", "production"]),
        v.description("The environment the application is running in."),
      ),
      "development",
    ),
    IS_TEST: v.optional(
      v.pipe(
        v.string(),
        v.description(
          "Flag indicating if the application is running in a test environment. Defaults to 'false'.",
        ),
      ),
      "false",
    ),
  },
});

// export default defineEnv({
//   extends: [vercel],
//   clientPrefix: "NEXT_PUBLIC_",
//   client: {
//     NEXT_PUBLIC_API_URL: z
//       .string()
//       .url()
//       .describe("The URL of the API endpoint."),
//   },
//   server: {
//     SERVER_NUMBER: z.coerce
//       .number()
//       .min(10)
//       .describe(
//         "The unique number identifying the server (must be 1 for this configuration).",
//       ),
//     SERVER_NAME: z.literal("Server 1"),
//   },
//   shared: {
//     NODE_ENV: z.enum(["development", "production"]).default("development"),
//     IS_TEST: z
//       .string()
//       .default("false")
//       .describe(
//         "Flag indicating if the application is running in a test environment. Defaults to 'false'.",
//       ),
//   },
// });
