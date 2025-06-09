import { defineEnv } from "envin";
import { vercel } from "envin/presets/zod";
import { z } from "zod";

export default defineEnv({
  extends: [vercel],
  shared: {
    NODE_ENV: z.enum(["development", "production"]),
  },
});
