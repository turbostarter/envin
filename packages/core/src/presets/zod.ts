/**
 * Presets for Zod
 *  * @module
 */
import * as z from "zod";
import type { InferPresetOutput, Preset } from "../types";

/**
 * Vercel System Environment Variables
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const vercel = {
  id: "vercel",
  server: {
    VERCEL: z.string().optional(),
    CI: z.string().optional(),
    VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .optional()
      .default("development"),
    VERCEL_TARGET_ENV: z.string().optional(),
    VERCEL_URL: z.url().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.url().optional(),
    VERCEL_BRANCH_URL: z.url().optional(),
    VERCEL_REGION: z.string().optional(),
    VERCEL_DEPLOYMENT_ID: z.string().optional(),
    VERCEL_SKEW_PROTECTION_ENABLED: z.string().optional(),
    VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
    VERCEL_GIT_PROVIDER: z.string().optional(),
    VERCEL_GIT_REPO_SLUG: z.string().optional(),
    VERCEL_GIT_REPO_OWNER: z.string().optional(),
    VERCEL_GIT_REPO_ID: z.string().optional(),
    VERCEL_GIT_COMMIT_REF: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().optional(),
    VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),
    VERCEL_GIT_PULL_REQUEST_ID: z.string().optional(),
  },
} as const satisfies Preset;

export type VercelEnv = InferPresetOutput<typeof vercel>;

/**
 * Neon for Vercel Environment Variables
 * @see https://neon.tech/docs/guides/vercel-native-integration#environment-variables-set-by-the-integration
 */
export const neonVercel = {
  id: "neon-vercel",
  server: {
    DATABASE_URL: z.string(),
    DATABASE_URL_UNPOOLED: z.string().optional(),
    PGHOST: z.string().optional(),
    PGHOST_UNPOOLED: z.string().optional(),
    PGUSER: z.string().optional(),
    PGDATABASE: z.string().optional(),
    PGPASSWORD: z.string().optional(),
    POSTGRES_URL: z.url().optional(),
    POSTGRES_URL_NON_POOLING: z.url().optional(),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_HOST: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_DATABASE: z.string().optional(),
    POSTGRES_URL_NO_SSL: z.url().optional(),
    POSTGRES_PRISMA_URL: z.url().optional(),
  },
} as const satisfies Preset;

export type NeonVercelEnv = InferPresetOutput<typeof neonVercel>;

/**
 * @see https://docs.uploadthing.com/getting-started/appdir#add-env-variables
 */
export const uploadthing = {
  id: "uploadthing",
  server: {
    UPLOADTHING_TOKEN: z.string(),
  },
} as const satisfies Preset;

export type UploadthingEnv = InferPresetOutput<typeof uploadthing>;

/**
 * Render System Environment Variables
 * @see https://docs.render.com/environment-variables#all-runtimes
 */
export const render = {
  id: "render",
  server: {
    IS_PULL_REQUEST: z.string().optional(),
    RENDER_DISCOVERY_SERVICE: z.string().optional(),
    RENDER_EXTERNAL_HOSTNAME: z.string().optional(),
    RENDER_EXTERNAL_URL: z.url().optional(),
    RENDER_GIT_BRANCH: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    RENDER_GIT_REPO_SLUG: z.string().optional(),
    RENDER_INSTANCE_ID: z.string().optional(),
    RENDER_SERVICE_ID: z.string().optional(),
    RENDER_SERVICE_NAME: z.string().optional(),
    RENDER_SERVICE_TYPE: z
      .enum(["web", "pserv", "cron", "worker", "static"])
      .optional(),
    RENDER: z.string().optional(),
  },
} as const satisfies Preset;

export type RenderEnv = InferPresetOutput<typeof render>;

/**
 * Railway Environment Variables
 * @see https://docs.railway.app/reference/variables#railway-provided-variables
 */
export const railway = {
  id: "railway",
  server: {
    RAILWAY_PUBLIC_DOMAIN: z.string().optional(),
    RAILWAY_PRIVATE_DOMAIN: z.string().optional(),
    RAILWAY_TCP_PROXY_DOMAIN: z.string().optional(),
    RAILWAY_TCP_PROXY_PORT: z.string().optional(),
    RAILWAY_TCP_APPLICATION_PORT: z.string().optional(),
    RAILWAY_PROJECT_NAME: z.string().optional(),
    RAILWAY_PROJECT_ID: z.string().optional(),
    RAILWAY_ENVIRONMENT_NAME: z.string().optional(),
    RAILWAY_ENVIRONMENT_ID: z.string().optional(),
    RAILWAY_SERVICE_NAME: z.string().optional(),
    RAILWAY_SERVICE_ID: z.string().optional(),
    RAILWAY_REPLICA_ID: z.string().optional(),
    RAILWAY_DEPLOYMENT_ID: z.string().optional(),
    RAILWAY_SNAPSHOT_ID: z.string().optional(),
    RAILWAY_VOLUME_NAME: z.string().optional(),
    RAILWAY_VOLUME_MOUNT_PATH: z.string().optional(),
    RAILWAY_RUN_UID: z.string().optional(),
    RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
    RAILWAY_GIT_AUTHOR_EMAIL: z.string().optional(),
    RAILWAY_GIT_BRANCH: z.string().optional(),
    RAILWAY_GIT_REPO_NAME: z.string().optional(),
    RAILWAY_GIT_REPO_OWNER: z.string().optional(),
    RAILWAY_GIT_COMMIT_MESSAGE: z.string().optional(),
  },
} as const satisfies Preset;

export type RailwayEnv = InferPresetOutput<typeof railway>;

/**
 * Fly.io Environment Variables
 * @see https://fly.io/docs/machines/runtime-environment/#environment-variables
 */
export const fly = {
  id: "fly",
  server: {
    FLY_APP_NAME: z.string().optional(),
    FLY_MACHINE_ID: z.string().optional(),
    FLY_ALLOC_ID: z.string().optional(),
    FLY_REGION: z.string().optional(),
    FLY_PUBLIC_IP: z.string().optional(),
    FLY_IMAGE_REF: z.string().optional(),
    FLY_MACHINE_VERSION: z.string().optional(),
    FLY_PRIVATE_IP: z.string().optional(),
    FLY_PROCESS_GROUP: z.string().optional(),
    FLY_VM_MEMORY_MB: z.string().optional(),
    PRIMARY_REGION: z.string().optional(),
  },
} as const satisfies Preset;

export type FlyEnv = InferPresetOutput<typeof fly>;

/**
 * Netlify Environment Variables
 * @see https://docs.netlify.com/configure-builds/environment-variables
 */
export const netlify = {
  id: "netlify",
  server: {
    NETLIFY: z.string().optional(),
    BUILD_ID: z.string().optional(),
    CONTEXT: z
      .enum(["production", "deploy-preview", "branch-deploy", "dev"])
      .optional(),
    REPOSITORY_URL: z.string().optional(),
    BRANCH: z.string().optional(),
    URL: z.string().optional(),
    DEPLOY_URL: z.string().optional(),
    DEPLOY_PRIME_URL: z.string().optional(),
    DEPLOY_ID: z.string().optional(),
    SITE_NAME: z.string().optional(),
    SITE_ID: z.string().optional(),
  },
} as const satisfies Preset;

export type NetlifyEnv = InferPresetOutput<typeof netlify>;

/**
 * Upstash redis Environment Variables
 * @see https://upstash.com/docs/redis/howto/connectwithupstashredis
 */
export const upstashRedis = {
  id: "upstash-redis",
  server: {
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
  },
} as const satisfies Preset;

export type UpstashRedisEnv = InferPresetOutput<typeof upstashRedis>;

/**
 * Coolify Environment Variables
 * @see https://coolify.io/docs/knowledge-base/environment-variables#predefined-variables
 */
export const coolify = {
  id: "coolify",
  server: {
    COOLIFY_FQDN: z.string().optional(),
    COOLIFY_URL: z.string().optional(),
    COOLIFY_BRANCH: z.string().optional(),
    COOLIFY_RESOURCE_UUID: z.string().optional(),
    COOLIFY_CONTAINER_NAME: z.string().optional(),
    SOURCE_COMMIT: z.string().optional(),
    PORT: z.string().optional(),
    HOST: z.string().optional(),
  },
} as const satisfies Preset;

export type CoolifyEnv = InferPresetOutput<typeof coolify>;

/**
 * Supabase for Vercel Environment Variables
 * @see https://vercel.com/marketplace/supabase
 */
export const supabaseVercel = {
  id: "supabase-vercel",
  clientPrefix: "NEXT_PUBLIC_",
  server: {
    POSTGRES_URL: z.url(),
    POSTGRES_PRISMA_URL: z.url().optional(),
    POSTGRES_URL_NON_POOLING: z.url().optional(),
    POSTGRES_USER: z.string().optional(),
    POSTGRES_HOST: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_DATABASE: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_JWT_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  },
} as const satisfies Preset;

export type SupabaseVercelEnv = InferPresetOutput<typeof supabaseVercel>;

/**
 * Vite Environment Variables
 * @see https://vite.dev/guide/env-and-mode
 */
export const vite = {
  id: "vite",
  shared: {
    BASE_URL: z.string().optional(),
    MODE: z.string().optional(),
    DEV: z.boolean().optional(),
    PROD: z.boolean().optional(),
    SSR: z.boolean().optional(),
  },
} as const satisfies Preset;

export type ViteEnv = InferPresetOutput<typeof vite>;

/**
 * WXT Environment Variables
 * @see https://wxt.dev/guide/essentials/config/environment-variables.html#built-in-environment-variables
 */
export const wxt = {
  id: "wxt",
  server: {
    MANIFEST_VERSION: z
      .preprocess(Number, z.union([z.literal(2), z.literal(3)]))
      .optional(),
    BROWSER: z
      .enum(["chrome", "firefox", "safari", "edge", "opera"])
      .optional(),
    CHROME: z.boolean().optional(),
    FIREFOX: z.boolean().optional(),
    SAFARI: z.boolean().optional(),
    EDGE: z.boolean().optional(),
    OPERA: z.boolean().optional(),
  },
} as const satisfies Preset;

export type WxtEnv = InferPresetOutput<typeof wxt>;
