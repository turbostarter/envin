/**
 * Presets for ArkType
 * @see https://arktype.io/
 * @module
 */
import { type } from "arktype";
import type { InferPresetOutput, Preset } from "../types";

/**
 * Vercel System Environment Variables
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const vercel = {
  id: "vercel",
  server: {
    VERCEL: type("string | undefined"),
    CI: type("string | undefined"),
    VERCEL_ENV: type("'development'|'preview'|'production' | undefined"),
    VERCEL_URL: type("string.url | undefined"),
    VERCEL_PROJECT_PRODUCTION_URL: type("string.url | undefined"),
    VERCEL_BRANCH_URL: type("string.url | undefined"),
    VERCEL_REGION: type("string | undefined"),
    VERCEL_DEPLOYMENT_ID: type("string | undefined"),
    VERCEL_SKEW_PROTECTION_ENABLED: type("string | undefined"),
    VERCEL_AUTOMATION_BYPASS_SECRET: type("string | undefined"),
    VERCEL_GIT_PROVIDER: type("string | undefined"),
    VERCEL_GIT_REPO_SLUG: type("string | undefined"),
    VERCEL_GIT_REPO_OWNER: type("string | undefined"),
    VERCEL_GIT_REPO_ID: type("string | undefined"),
    VERCEL_GIT_COMMIT_REF: type("string | undefined"),
    VERCEL_GIT_COMMIT_SHA: type("string | undefined"),
    VERCEL_GIT_COMMIT_MESSAGE: type("string | undefined"),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: type("string | undefined"),
    VERCEL_GIT_COMMIT_AUTHOR_NAME: type("string | undefined"),
    VERCEL_GIT_PREVIOUS_SHA: type("string | undefined"),
    VERCEL_GIT_PULL_REQUEST_ID: type("string | undefined"),
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
    DATABASE_URL: type("string.url"),
    DATABASE_URL_UNPOOLED: type("string.url | undefined"),
    PGHOST: type("string | undefined"),
    PGHOST_UNPOOLED: type("string | undefined"),
    PGUSER: type("string | undefined"),
    PGDATABASE: type("string | undefined"),
    PGPASSWORD: type("string | undefined"),
    POSTGRES_URL: type("string.url | undefined"),
    POSTGRES_URL_NON_POOLING: type("string.url | undefined"),
    POSTGRES_USER: type("string | undefined"),
    POSTGRES_HOST: type("string | undefined"),
    POSTGRES_PASSWORD: type("string | undefined"),
    POSTGRES_DATABASE: type("string | undefined"),
    POSTGRES_URL_NO_SSL: type("string.url | undefined"),
    POSTGRES_PRISMA_URL: type("string.url | undefined"),
  },
} as const satisfies Preset;

export type NeonVercelEnv = InferPresetOutput<typeof neonVercel>;

/**
 * @see https://docs.uploadthing.com/getting-started/appdir#add-env-variables
 */
export const uploadthing = {
  id: "uploadthing",
  server: {
    UPLOADTHING_TOKEN: type("string"),
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
    IS_PULL_REQUEST: type("string | undefined"),
    RENDER_DISCOVERY_SERVICE: type("string | undefined"),
    RENDER_EXTERNAL_HOSTNAME: type("string | undefined"),
    RENDER_EXTERNAL_URL: type("string.url | undefined"),
    RENDER_GIT_BRANCH: type("string | undefined"),
    RENDER_GIT_COMMIT: type("string | undefined"),
    RENDER_GIT_REPO_SLUG: type("string | undefined"),
    RENDER_INSTANCE_ID: type("string | undefined"),
    RENDER_SERVICE_ID: type("string | undefined"),
    RENDER_SERVICE_NAME: type("string | undefined"),
    RENDER_SERVICE_TYPE: type(
      "'web'|'pserv'|'cron'|'worker'|'static' | undefined",
    ),
    RENDER: type("string | undefined"),
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
    RAILWAY_PUBLIC_DOMAIN: type("string.url | undefined"),
    RAILWAY_PRIVATE_DOMAIN: type("string.url | undefined"),
    RAILWAY_TCP_PROXY_DOMAIN: type("string.url | undefined"),
    RAILWAY_TCP_PROXY_PORT: type("string | undefined"),
    RAILWAY_TCP_APPLICATION_PORT: type("string | undefined"),
    RAILWAY_PROJECT_NAME: type("string | undefined"),
    RAILWAY_PROJECT_ID: type("string | undefined"),
    RAILWAY_ENVIRONMENT_NAME: type("string | undefined"),
    RAILWAY_ENVIRONMENT_ID: type("string | undefined"),
    RAILWAY_SERVICE_NAME: type("string | undefined"),
    RAILWAY_SERVICE_ID: type("string | undefined"),
    RAILWAY_REPLICA_ID: type("string | undefined"),
    RAILWAY_DEPLOYMENT_ID: type("string | undefined"),
    RAILWAY_SNAPSHOT_ID: type("string | undefined"),
    RAILWAY_VOLUME_NAME: type("string | undefined"),
    RAILWAY_VOLUME_MOUNT_PATH: type("string | undefined"),
    RAILWAY_RUN_UID: type("string | undefined"),
    RAILWAY_GIT_COMMIT_SHA: type("string | undefined"),
    RAILWAY_GIT_AUTHOR_EMAIL: type("string | undefined"),
    RAILWAY_GIT_BRANCH: type("string | undefined"),
    RAILWAY_GIT_REPO_NAME: type("string | undefined"),
    RAILWAY_GIT_REPO_OWNER: type("string | undefined"),
    RAILWAY_GIT_COMMIT_MESSAGE: type("string | undefined"),
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
    FLY_APP_NAME: type("string | undefined"),
    FLY_MACHINE_ID: type("string | undefined"),
    FLY_ALLOC_ID: type("string | undefined"),
    FLY_REGION: type("string | undefined"),
    FLY_PUBLIC_IP: type("string | undefined"),
    FLY_IMAGE_REF: type("string | undefined"),
    FLY_MACHINE_VERSION: type("string | undefined"),
    FLY_PRIVATE_IP: type("string | undefined"),
    FLY_PROCESS_GROUP: type("string | undefined"),
    FLY_VM_MEMORY_MB: type("string | undefined"),
    PRIMARY_REGION: type("string | undefined"),
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
    NETLIFY: type("string | undefined"),
    BUILD_ID: type("string | undefined"),
    CONTEXT: type(
      "'production'|'deploy-preview'|'branch-deploy'|'dev' | undefined",
    ),
    REPOSITORY_URL: type("string.url | undefined"),
    BRANCH: type("string | undefined"),
    URL: type("string.url | undefined"),
    DEPLOY_URL: type("string.url | undefined"),
    DEPLOY_PRIME_URL: type("string.url | undefined"),
    DEPLOY_ID: type("string | undefined"),
    SITE_NAME: type("string | undefined"),
    SITE_ID: type("string | undefined"),
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
    UPSTASH_REDIS_REST_URL: type("string.url"),
    UPSTASH_REDIS_REST_TOKEN: type("string"),
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
    COOLIFY_FQDN: type("string | undefined"),
    COOLIFY_URL: type("string | undefined"),
    COOLIFY_BRANCH: type("string | undefined"),
    COOLIFY_RESOURCE_UUID: type("string | undefined"),
    COOLIFY_CONTAINER_NAME: type("string | undefined"),
    SOURCE_COMMIT: type("string | undefined"),
    PORT: type("string | undefined"),
    HOST: type("string | undefined"),
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
    POSTGRES_URL: type("string"),
    POSTGRES_PRISMA_URL: type("string | undefined"),
    POSTGRES_URL_NON_POOLING: type("string | undefined"),
    POSTGRES_USER: type("string | undefined"),
    POSTGRES_HOST: type("string | undefined"),
    POSTGRES_PASSWORD: type("string | undefined"),
    POSTGRES_DATABASE: type("string | undefined"),
    SUPABASE_SERVICE_ROLE_KEY: type("string | undefined"),
    SUPABASE_ANON_KEY: type("string | undefined"),
    SUPABASE_URL: type("string | undefined"),
    SUPABASE_JWT_SECRET: type("string | undefined"),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: type("string | undefined"),
    NEXT_PUBLIC_SUPABASE_URL: type("string | undefined"),
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
    BASE_URL: type("string | undefined"),
    MODE: type("string | undefined"),
    DEV: type("boolean | undefined"),
    PROD: type("boolean | undefined"),
    SSR: type("boolean | undefined"),
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
    MANIFEST_VERSION: type("'2' | '3' | undefined").pipe((s) =>
      s ? Number.parseInt(s, 10) : undefined,
    ),
    BROWSER: type("'chrome'|'firefox'|'safari'|'edge'|'opera' | undefined"),
    CHROME: type("boolean | undefined"),
    FIREFOX: type("boolean | undefined"),
    SAFARI: type("boolean | undefined"),
    EDGE: type("boolean | undefined"),
    OPERA: type("boolean | undefined"),
  },
} as const satisfies Preset;

export type WxtEnv = InferPresetOutput<typeof wxt>;
