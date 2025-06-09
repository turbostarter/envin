import env from "env.config";
import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    metadataBase: baseUrl,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://envin.turbostarter.dev",
      images: "/images/banner.png",
      siteName: "Envin",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@bzagrodzki",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "/images/banner.png",
      ...override.twitter,
    },
  };
}

export const baseUrl =
  env.NODE_ENV === "development"
    ? new URL("http://localhost:3000")
    : new URL(
        `https://${env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL}`,
      );
