import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          text: "Home",
          url: "/",
        },
        {
          text: "Docs",
          url: "/docs",
          active: "nested-url",
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
