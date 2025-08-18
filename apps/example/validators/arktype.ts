import { type } from "arktype";
import { vercel } from "envin/presets/arktype";

const stripe = {
  // id: "stripe",
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: type("string"),
  },
  server: {
    STRIPE_SECRET_KEY: type("string"),
    STRIPE_WEBHOOK_SECRET: type("string"),
  },
} as const;

export const config = {
  extends: [vercel, stripe],
  shared: {
    NODE_ENV: type("'development' | 'production' | undefined").pipe(
      (v) => v ?? "development",
    ),
  },
  clientPrefix: "NEXT_PUBLIC_",
  client: {
    NEXT_PUBLIC_API_URL: type("string.url"),
  },
  server: {
    DATABASE_URL: type("string.url"),
  },
} as const;
