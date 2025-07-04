import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Shrub } from "lucide-react";
import { GITHUB_URL } from "@/lib/constants";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Shrub className="size-6" />
        <span className="text-lg font-semibold">Envin</span>
      </>
    ),
  },
  githubUrl: GITHUB_URL,
  links: [
    {
      text: "Home",
      url: "/",
    },
    {
      text: "Docs",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
