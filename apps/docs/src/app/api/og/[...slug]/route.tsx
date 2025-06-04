import { readFileSync } from "node:fs";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { source } from "@/lib/source";

const font = readFileSync("./src/app/api/og/[...slug]/Geist-Regular.ttf");
const fontBold = readFileSync("./src/app/api/og/[...slug]/Geist-Bold.ttf");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <div tw="flex flex-col w-full h-full bg-black text-white items-center justify-center">
      <h1 tw="text-7xl font-bold tracking-tighter leading-tight">
        {page.data.title}
      </h1>
      <p tw="text-xl max-w-2xl leading-snug text-center tracking-tight text-[#a1a1a1]">
        {page.data.description}
      </p>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: font,
          weight: 400,
        },
        {
          name: "Geist",
          data: fontBold,
          weight: 600,
        },
      ],
    },
  );
}

export function generateStaticParams() {
  return source.generateParams().map((page) => ({
    ...page,
    slug: [...page.slug, "image.png"],
  }));
}
