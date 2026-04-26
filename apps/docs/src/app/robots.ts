import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("sitemap.xml", baseUrl).toString(),
    host: baseUrl.origin,
  };
}
