#!/usr/bin/env node
import { program } from "commander";
import packageJson from "../../package.json";
import { dev } from "./commands/dev";

const PACKAGE_NAME = "@envin/cli";

program
  .name(PACKAGE_NAME)
  .description(
    "A live preview of your environment variables right in your browser",
  )
  .version(packageJson.version);

program
  .command("dev")
  .description("Starts the live preview of your environment variables")
  .option("-c, --config <path>", "Path to env.config.ts")
  .option("-e, --env <path...>", "Path(s) to .env file(s) or directories")
  .option("--cascade", "Enable workspace env/config cascading", false)
  .option("-p --port <port>", "Port to run dev server on", "3000")
  .option("-v, --verbose", "Enable verbose logging", false)
  .action(dev);

program.parse();
