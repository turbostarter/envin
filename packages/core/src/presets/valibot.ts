/**
 * Presets for Valibot
 * @module
 */
import * as v from "valibot";
import type { InferPresetOutput } from "../types";

/**
 * Vercel System Environment Variables
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const vercel = {
  id: "vercel",
  server: {
    VERCEL: v.optional(v.string()),
    CI: v.optional(v.string()),
    VERCEL_ENV: v.optional(
      v.picklist(["development", "preview", "production"]),
      "development",
    ),
    VERCEL_URL: v.optional(v.string()),
    VERCEL_PROJECT_PRODUCTION_URL: v.optional(v.string()),
    VERCEL_BRANCH_URL: v.optional(v.string()),
    VERCEL_REGION: v.optional(v.string()),
    VERCEL_DEPLOYMENT_ID: v.optional(v.string()),
    VERCEL_SKEW_PROTECTION_ENABLED: v.optional(v.string()),
    VERCEL_AUTOMATION_BYPASS_SECRET: v.optional(v.string()),
    VERCEL_GIT_PROVIDER: v.optional(v.string()),
    VERCEL_GIT_REPO_SLUG: v.optional(v.string()),
    VERCEL_GIT_REPO_OWNER: v.optional(v.string()),
    VERCEL_GIT_REPO_ID: v.optional(v.string()),
    VERCEL_GIT_COMMIT_REF: v.optional(v.string()),
    VERCEL_GIT_COMMIT_SHA: v.optional(v.string()),
    VERCEL_GIT_COMMIT_MESSAGE: v.optional(v.string()),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: v.optional(v.string()),
    VERCEL_GIT_COMMIT_AUTHOR_NAME: v.optional(v.string()),
    VERCEL_GIT_PREVIOUS_SHA: v.optional(v.string()),
    VERCEL_GIT_PULL_REQUEST_ID: v.optional(v.string()),
  },
} as const;

export type VercelEnv = InferPresetOutput<typeof vercel>;

/**
 * Neon for Vercel Environment Variables
 * @see https://neon.tech/docs/guides/vercel-native-integration#environment-variables-set-by-the-integration
 */
export const neonVercel = {
  id: "neon-vercel",
  server: {
    DATABASE_URL: v.string(),
    DATABASE_URL_UNPOOLED: v.optional(v.string()),
    PGHOST: v.optional(v.string()),
    PGHOST_UNPOOLED: v.optional(v.string()),
    PGUSER: v.optional(v.string()),
    PGDATABASE: v.optional(v.string()),
    PGPASSWORD: v.optional(v.string()),
    POSTGRES_URL: v.optional(v.pipe(v.string(), v.url())),
    POSTGRES_URL_NON_POOLING: v.optional(v.pipe(v.string(), v.url())),
    POSTGRES_USER: v.optional(v.string()),
    POSTGRES_HOST: v.optional(v.string()),
    POSTGRES_PASSWORD: v.optional(v.string()),
    POSTGRES_DATABASE: v.optional(v.string()),
    POSTGRES_URL_NO_SSL: v.optional(v.pipe(v.string(), v.url())),
    POSTGRES_PRISMA_URL: v.optional(v.pipe(v.string(), v.url())),
  },
} as const;

export type NeonVercelEnv = InferPresetOutput<typeof neonVercel>;

/**
 * @see https://docs.uploadthing.com/getting-started/appdir#add-env-variables
 */
export const uploadthing = {
  id: "uploadthing",
  server: {
    UPLOADTHING_TOKEN: v.string(),
  },
} as const;

export type UploadthingEnv = InferPresetOutput<typeof uploadthing>;

/**
 * Render System Environment Variables
 * @see https://docs.render.com/environment-variables#all-runtimes
 */
export const render = {
  id: "render",
  server: {
    IS_PULL_REQUEST: v.optional(v.string()),
    RENDER_DISCOVERY_SERVICE: v.optional(v.string()),
    RENDER_EXTERNAL_HOSTNAME: v.optional(v.string()),
    RENDER_EXTERNAL_URL: v.optional(v.pipe(v.string(), v.url())),
    RENDER_GIT_BRANCH: v.optional(v.string()),
    RENDER_GIT_COMMIT: v.optional(v.string()),
    RENDER_GIT_REPO_SLUG: v.optional(v.string()),
    RENDER_INSTANCE_ID: v.optional(v.string()),
    RENDER_SERVICE_ID: v.optional(v.string()),
    RENDER_SERVICE_NAME: v.optional(v.string()),
    RENDER_SERVICE_TYPE: v.optional(
      v.picklist(["web", "pserv", "cron", "worker", "static"]),
    ),
    RENDER: v.optional(v.string()),
  },
} as const;

export type RenderEnv = InferPresetOutput<typeof render>;

/**
 * Railway Environment Variables
 * @see https://docs.railway.app/reference/variables#railway-provided-variables
 */
export const railway = {
  id: "railway",
  server: {
    RAILWAY_PUBLIC_DOMAIN: v.optional(v.string()),
    RAILWAY_PRIVATE_DOMAIN: v.optional(v.string()),
    RAILWAY_TCP_PROXY_DOMAIN: v.optional(v.string()),
    RAILWAY_TCP_PROXY_PORT: v.optional(v.string()),
    RAILWAY_TCP_APPLICATION_PORT: v.optional(v.string()),
    RAILWAY_PROJECT_NAME: v.optional(v.string()),
    RAILWAY_PROJECT_ID: v.optional(v.string()),
    RAILWAY_ENVIRONMENT_NAME: v.optional(v.string()),
    RAILWAY_ENVIRONMENT_ID: v.optional(v.string()),
    RAILWAY_SERVICE_NAME: v.optional(v.string()),
    RAILWAY_SERVICE_ID: v.optional(v.string()),
    RAILWAY_REPLICA_ID: v.optional(v.string()),
    RAILWAY_DEPLOYMENT_ID: v.optional(v.string()),
    RAILWAY_SNAPSHOT_ID: v.optional(v.string()),
    RAILWAY_VOLUME_NAME: v.optional(v.string()),
    RAILWAY_VOLUME_MOUNT_PATH: v.optional(v.string()),
    RAILWAY_RUN_UID: v.optional(v.string()),
    RAILWAY_GIT_COMMIT_SHA: v.optional(v.string()),
    RAILWAY_GIT_AUTHOR_EMAIL: v.optional(v.string()),
    RAILWAY_GIT_BRANCH: v.optional(v.string()),
    RAILWAY_GIT_REPO_NAME: v.optional(v.string()),
    RAILWAY_GIT_REPO_OWNER: v.optional(v.string()),
    RAILWAY_GIT_COMMIT_MESSAGE: v.optional(v.string()),
  },
} as const;

export type RailwayEnv = InferPresetOutput<typeof railway>;

/**
 * Fly.io Environment Variables
 * @see https://fly.io/docs/machines/runtime-environment/#environment-variables
 */
export const fly = {
  id: "fly",
  server: {
    FLY_APP_NAME: v.optional(v.string()),
    FLY_MACHINE_ID: v.optional(v.string()),
    FLY_ALLOC_ID: v.optional(v.string()),
    FLY_REGION: v.optional(v.string()),
    FLY_PUBLIC_IP: v.optional(v.string()),
    FLY_IMAGE_REF: v.optional(v.string()),
    FLY_MACHINE_VERSION: v.optional(v.string()),
    FLY_PRIVATE_IP: v.optional(v.string()),
    FLY_PROCESS_GROUP: v.optional(v.string()),
    FLY_VM_MEMORY_MB: v.optional(v.string()),
    PRIMARY_REGION: v.optional(v.string()),
  },
} as const;

export type FlyEnv = InferPresetOutput<typeof fly>;

/**
 * Netlify Environment Variables
 * @see https://docs.netlify.com/configure-builds/environment-variables
 */
export const netlify = {
  id: "netlify",
  server: {
    NETLIFY: v.optional(v.string()),
    BUILD_ID: v.optional(v.string()),
    CONTEXT: v.optional(
      v.picklist(["production", "deploy-preview", "branch-deploy", "dev"]),
    ),
    REPOSITORY_URL: v.optional(v.string()),
    BRANCH: v.optional(v.string()),
    URL: v.optional(v.string()),
    DEPLOY_URL: v.optional(v.string()),
    DEPLOY_PRIME_URL: v.optional(v.string()),
    DEPLOY_ID: v.optional(v.string()),
    SITE_NAME: v.optional(v.string()),
    SITE_ID: v.optional(v.string()),
  },
} as const;

export type NetlifyEnv = InferPresetOutput<typeof netlify>;

/**
 * Upstash redis Environment Variables
 * @see https://upstash.com/docs/redis/howto/connectwithupstashredis
 */
export const upstashRedis = {
  id: "upstash-redis",
  server: {
    UPSTASH_REDIS_REST_URL: v.pipe(v.string(), v.url()),
    UPSTASH_REDIS_REST_TOKEN: v.string(),
  },
} as const;

export type UpstashRedisEnv = InferPresetOutput<typeof upstashRedis>;

/**
 * Coolify Environment Variables
 * @see https://coolify.io/docs/knowledge-base/environment-variables#predefined-variables
 */
export const coolify = {
  id: "coolify",
  server: {
    COOLIFY_FQDN: v.optional(v.string()),
    COOLIFY_URL: v.optional(v.string()),
    COOLIFY_BRANCH: v.optional(v.string()),
    COOLIFY_RESOURCE_UUID: v.optional(v.string()),
    COOLIFY_CONTAINER_NAME: v.optional(v.string()),
    SOURCE_COMMIT: v.optional(v.string()),
    PORT: v.optional(v.string()),
    HOST: v.optional(v.string()),
  },
} as const;

export type CoolifyEnv = InferPresetOutput<typeof coolify>;

/**
 * Supabase for Vercel Environment Variables
 * @see https://vercel.com/marketplace/supabase
 */
export const supabaseVercel = {
  id: "supabase-vercel",
  clientPrefix: "NEXT_PUBLIC_",
  server: {
    POSTGRES_URL: v.pipe(v.string(), v.url()),
    POSTGRES_PRISMA_URL: v.optional(v.pipe(v.string(), v.url())),
    POSTGRES_URL_NON_POOLING: v.optional(v.pipe(v.string(), v.url())),
    POSTGRES_USER: v.optional(v.string()),
    POSTGRES_HOST: v.optional(v.string()),
    POSTGRES_PASSWORD: v.optional(v.string()),
    POSTGRES_DATABASE: v.optional(v.string()),
    SUPABASE_SERVICE_ROLE_KEY: v.optional(v.string()),
    SUPABASE_ANON_KEY: v.optional(v.string()),
    SUPABASE_URL: v.optional(v.pipe(v.string(), v.url())),
    SUPABASE_JWT_SECRET: v.optional(v.string()),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: v.optional(v.string()),
    NEXT_PUBLIC_SUPABASE_URL: v.optional(v.pipe(v.string(), v.url())),
  },
} as const;

export type SupabaseVercelEnv = InferPresetOutput<typeof supabaseVercel>;

/**
 * Vite Environment Variables
 * @see https://vite.dev/guide/env-and-mode
 */
export const vite = {
  id: "vite",
  server: {
    BASE_URL: v.optional(v.string()),
    MODE: v.optional(v.string()),
    DEV: v.optional(v.boolean()),
    PROD: v.optional(v.boolean()),
    SSR: v.optional(v.boolean()),
  },
} as const;

export type ViteEnv = InferPresetOutput<typeof vite>;

/**
 * WXT Environment Variables
 * @see https://wxt.dev/guide/essentials/config/environment-variables.html#built-in-environment-variables
 */
export const wxt = {
  id: "wxt",
  server: {
    MANIFEST_VERSION: v.optional(
      v.pipe(v.union([v.literal(2), v.literal(3)]), v.transform(Number)),
    ),
    BROWSER: v.optional(
      v.picklist(["chrome", "firefox", "safari", "edge", "opera"]),
    ),
    CHROME: v.optional(v.boolean()),
    FIREFOX: v.optional(v.boolean()),
    SAFARI: v.optional(v.boolean()),
    EDGE: v.optional(v.boolean()),
    OPERA: v.optional(v.boolean()),
  },
} as const;

export type WxtEnv = InferPresetOutput<typeof wxt>;
