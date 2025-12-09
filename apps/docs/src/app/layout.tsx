import { fonts } from "@/lib/fonts";
import "./global.css";
import { Analytics } from "@vercel/analytics/react";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme";

export const metadata = createMetadata({
  title: {
    template: "%s | Envin",
    default: "Envin - Type-safe env validation with live previews",
  },
  description:
    "Framework-agnostic, type-safe tool to validate and preview your environment variables—powered by your favorite schema validator.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("flex min-h-screen flex-col", fonts)}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <RootProvider>{children}</RootProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
