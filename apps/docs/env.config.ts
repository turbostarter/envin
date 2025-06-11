import { defineEnv } from "envin";
import { vercel } from "envin/presets/zod";
import { z } from "zod";

const env = defineEnv({
  extends: [vercel],
  shared: {
    NODE_ENV: z.enum(["development", "production"]),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
  },
  skip: true,
});

console.log(env.NEXT_PUBLIC_API_URL);

export default env;
