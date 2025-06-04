import { HomeLayout, type HomeLayoutProps } from "fumadocs-ui/layouts/home";
import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";

const homeOptions: HomeLayoutProps = {
  ...baseOptions,
  links: [
    {
      icon: <FileText />,
      text: "Documentation",
      url: "/docs",
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...homeOptions}
      className="pt-0 [&>header]:shadow-none [&>header]:border-none"
    >
      {children}
    </HomeLayout>
  );
}
