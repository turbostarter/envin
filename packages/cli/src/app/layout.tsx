import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Shrub } from "lucide-react";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Envin",
  description:
    "Framework-agnostic, type-safe tool to validate and preview your environment variables—powered by your favorite schema validator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col h-full gap-4 py-6 px-8">
          <header className="flex items-center gap-3">
            <Shrub className="size-11 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">Envin</h1>
              <p className="text-sm text-muted-foreground">
                Manage environment variables for your project. Validate and set
                them up in seconds.
              </p>
            </div>
          </header>
          <main className="flex flex-col gap-4 min-h-0 h-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
