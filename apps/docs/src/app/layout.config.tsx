import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FileText, Shrub } from "lucide-react";
import { GITHUB_URL } from "@/lib/source";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Shrub className="size-6.5" />
        <span className="text-lg">Envin</span>
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      icon: <FileText />,
      text: "Documentation",
      url: "/docs",
    },
  ],
  githubUrl: GITHUB_URL,
};
