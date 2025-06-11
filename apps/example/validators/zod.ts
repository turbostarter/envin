import { vercel } from "envin/presets/zod";
import { z as v3 } from "zod/v3";
import { z as v4 } from "zod/v4";

const zodV3 = () => {
  const stripe = {
    id: "stripe",
    clientPrefix: "NEXT_PUBLIC_",
    client: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: v3
        .string()
        .describe("The Stripe publishable key."),
    },
    server: {
      STRIPE_SECRET_KEY: v3.string().describe("The Stripe secret key."),
      STRIPE_WEBHOOK_SECRET: v3
        .string()
        .min(1)
        .describe("The Stripe webhook secret."),
    },
  } as const;

  return {
    extends: [vercel, stripe],
    shared: {
      NODE_ENV: v3
        .enum(["development", "production"])
        .default("development")
        .describe("The environment the application is running in."),
    },
    clientPrefix: "NEXT_PUBLIC_",
    client: {
      NEXT_PUBLIC_API_URL: v3
        .string()
        .url()
        .describe("The URL of the API endpoint."),
    },
    server: {
      DATABASE_URL: v3.string().url().describe("The URL of the database."),
    },
  } as const;
};

const zodV4 = () => {
  const stripe = {
    id: "stripe",
    clientPrefix: "NEXT_PUBLIC_",
    client: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: v4
        .string()
        .describe("The Stripe publishable key."),
    },
    server: {
      STRIPE_SECRET_KEY: v4.string().describe("The Stripe secret key."),
      STRIPE_WEBHOOK_SECRET: v4
        .string()
        .min(1)
        .describe("The Stripe webhook secret."),
    },
  } as const;

  return {
    extends: [vercel, stripe],
    shared: {
      NODE_ENV: v4
        .enum(["development", "production"])
        .default("development")
        .describe("The environment the application is running in."),
    },
    clientPrefix: "NEXT_PUBLIC_",
    client: {
      NEXT_PUBLIC_API_URL: v4.url().describe("The URL of the API endpoint."),
    },
    server: {
      DATABASE_URL: v4.url().describe("The URL of the database."),
    },
  } as const;
};

export const config = {
  v3: zodV3(),
  v4: zodV4(),
};
