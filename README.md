[![Envin](https://envin.turbostarter.dev/images/banner.png)](https://envin.turbostarter.dev)

## Installation

> [!NOTE]
>
> This is an ESM only package that requires a tsconfig with a module resolution that can read package.json#exports (`NodeNext` if transpiling with `tsc`, `Bundler` if using a bundler).

```bash
# Core package, no framework specific features
bun add envin

# CLI, used e.g. for live previews
bun add @envin/cli
```

For full documentation, see https://envin.turbostarter.dev

## Usage

> [!NOTE]
>
> You may use any [Standard Schema](https://github.com/standard-schema/standard-schema) compliant validator of your choice.

This package supports the full power of [most popular schema libraries](https://github.com/standard-schema/standard-schema?tab=readme-ov-file#what-schema-libraries-implement-the-spec), meaning you can use `transforms` and `default` values.

### Define your schema

```ts
// env.config.ts
import { defineEnv } from "envin";
import * as z from "zod"; 

export default defineEnv({
  /*
   * Shared environment variables, available on the client and server.
   */
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  /*
   * Prefix for client environment variables.
   */
  clientPrefix: "NEXT_PUBLIC_",
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.url(),
  },
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    DATABASE_URL: z.url(),
  },
  /*
   * In some cases, we need to manually destructure environment variables to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables are included here.
   */
  envStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

### Use the schema in your app with autocompletion and type inference

```ts
// route.ts
import env from "~/env.config";

export const GET = (req: Request) => {
  const DATABASE_URL = env.DATABASE_URL;
  // use it...
};
```

## Live Preview

One of the most powerful features of this package is the ability to preview your environment variables in a livemode.

```bash
# Run the CLI with your env.config.ts file
npx @envin/cli@latest dev
```

![Live Preview](https://envin.turbostarter.dev/images/docs/live-preview.png)

This will start a live preview server that will automatically update your environment variables when you change them allowing you to find and fix errors before deploying your app.

### CLI options

```bash
npx @envin/cli@latest dev [options]
```

Options:
- `-d, --dir <path>`: directory with your env config and `.env` files (default: `./`)
- `-c, --config <path>`: explicit path to `env.config.ts`
- `-e, --env <path>`: path to a `.env` file or directory
- `-p, --port <port>`: port to run the preview server (default: `3000`)
- `-v, --verbose`: enable verbose logging
- `--cascade`: enable workspace env/config cascading

#### Env loading behavior

When `--cascade` is enabled, the CLI:
- detects the workspace root by walking up from current working directory
- loads env files from the workspace root first, then the package directory, so package values override root values
- uses the following precedence within each directory:
  - `.env` → `.env.local` → `.env.development` → `.env.development.local`
  - `.env` → `.env.local` → `.env.production` → `.env.production.local`

If `-e` points to a file, only that file is used. If `-e` points to a directory, only that directory is used.


## Contributing

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md).