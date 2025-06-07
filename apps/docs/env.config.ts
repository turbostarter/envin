import { defineEnv } from "envin";
import { z } from "zod";

export default defineEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  server: {
    DATABASE_URL: z.string(),
  },
});
