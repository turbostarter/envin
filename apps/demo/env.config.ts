import { defineEnv } from "@turbostarter/env";
import { z } from "zod";

export default defineEnv({
  clientPrefix: "NEXT_PUBLIC_",
  client: z.object({
    NEXT_PUBLIC_API_URL: z.string().url().describe("The URL of the API"),
  }),
  server: z.discriminatedUnion("SERVER_NUMBER", [
    z.object({
      SERVER_NUMBER: z.literal(1),
      SERVER_NAME: z.literal("Server 1"),
    }),
    z.object({
      SERVER_NUMBER: z.literal(2),
      SERVER_NAME: z.literal("Server 2"),
    }),
  ]),
  shared: z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    IS_TEST: z.boolean().default(false),
  }),
});
