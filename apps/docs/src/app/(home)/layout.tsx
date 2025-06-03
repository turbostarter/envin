import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      className="pt-0 [&>header]:shadow-none [&>header]:border-none"
    >
      {children}
    </HomeLayout>
  );
}
