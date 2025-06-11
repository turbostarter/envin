import env from "env.config";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { GITHUB_URL, TURBOSTARTER_URL, X_USERNAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Hero />
      <Footer />
    </div>
  );
}

const Hero = () => {
  console.log(env.NEXT_PUBLIC_API_URL);
  return (
    <div className="flex flex-1 flex-col justify-center items-center text-center gap-6">
      <Link
        href="/docs/validators"
        target="_blank"
        className="inline-flex overflow-hidden w-fit items-center gap-2 rounded-full border bg-background py-1 pr-3 pl-1 text-foreground text-sm leading-6 shadow-xs"
        rel="noreferrer"
      >
        <span className="rounded-full bg-secondary px-2 font-semibold">
          New
        </span>
        <span className="font-medium truncate">Standard Schema support</span>
        <ArrowUpRight className="size-4" />
      </Link>
      <h1 className="max-w-3xl text-balance text-center font-semibold text-5xl leading-tighter tracking-tighter! sm:text-6xl md:max-w-4xl md:text-7xl ">
        Type-safe{" "}
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none mx-1 inline-block h-9 w-auto translate-y-0.5 select-none align-baseline sm:h-[38px] md:h-[53px] lg:h-14 md:translate-y-1"
        >
          <title>TypeScript</title>
          <path
            d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
            fill="#3178C6"
          />
        </svg>{" "}
        env validation with{" "}
        <div className="relative inline-flex size-6 mx-1 sm:size-7 md:size-8 lg:size-9">
          <div className="bg-green-500 inline-block size-full rounded-full" />
          <div className="bg-green-500 absolute size-full animate-ping rounded-full" />
        </div>{" "}
        live previews
      </h1>
      <p className="max-w-xl text-balance text-center text-muted-foreground md:max-w-2xl md:text-lg lg:text-xl leading-snug">
        Framework-agnostic, type-safe tool to validate and preview your
        environment variables - powered by your favorite schema validator.
      </p>

      <div className="flex gap-4">
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "has-[>svg]:px-6",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-background"
          >
            <title>GitHub</title>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Github
        </Link>
        <Link
          href="/docs"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Documentation
        </Link>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="py-4 md:py-6 text-center border-t border-dotted">
      <p className="text-muted-foreground text-sm">
        Made with ❤️ and{" "}
        <a
          href={TURBOSTARTER_URL}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          TurboStarter
        </a>{" "}
        by{" "}
        <a
          href={`https://x.com/${X_USERNAME}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          @{X_USERNAME}
        </a>
      </p>
    </footer>
  );
};
