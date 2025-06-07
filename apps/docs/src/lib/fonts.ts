import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { cn } from "@/lib/utils";

export const fonts = cn(
  "touch-manipulation font-sans antialiased",
  GeistSans.variable,
  GeistMono.variable,
);
