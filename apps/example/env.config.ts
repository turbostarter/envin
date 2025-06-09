import { defineEnv } from "envin";
import { vercel } from "envin/presets/zod";
import { z } from "zod";

const stripe = {
  // id: "stripe",
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .describe("The Stripe publishable key."),
  },
  server: {
    STRIPE_SECRET_KEY: z.string().describe("The Stripe secret key."),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .min(1)
      .describe("The Stripe webhook secret."),
  },
} as const;

export default defineEnv({
  extends: [vercel, stripe],
  shared: {
    NODE_ENV: z
      .enum(["development", "production"])
      .default("development")
      .describe("The environment the application is running in."),
  },
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: z
      .string()
      .url()
      .describe("The URL of the API endpoint."),
  },
  server: {
    DATABASE_URL: z.string().url().describe("The URL of the database."),
  },
});
