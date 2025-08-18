import { vercel } from "envin/presets/valibot";
import * as v from "valibot";

const stripe = {
  // id: "stripe",
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: v.pipe(
      v.string(),
      v.description("The Stripe publishable key."),
    ),
  },
  server: {
    STRIPE_SECRET_KEY: v.pipe(
      v.string(),
      v.description("The Stripe secret key."),
    ),
    STRIPE_WEBHOOK_SECRET: v.pipe(
      v.string(),
      v.minLength(1),
      v.description("The Stripe webhook secret."),
    ),
  },
} as const;

export const config = {
  extends: [vercel, stripe],
  shared: {
    NODE_ENV: v.pipe(
      v.optional(v.picklist(["development", "production"]), "development"),
      v.description("The environment the application is running in."),
    ),
  },
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: v.pipe(
      v.string(),
      v.url(),
      v.description("The URL of the API endpoint."),
    ),
  },
  server: {
    DATABASE_URL: v.pipe(
      v.string(),
      v.url(),
      v.description("The URL of the database."),
    ),
  },
} as const;
