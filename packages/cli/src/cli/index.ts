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
  .option(
    "-d, --dir <path>",
    "Directory with your envin configuration and .env files",
    "./",
  )
  .option("-p --port <port>", "Port to run dev server on", "3000")
  .action(dev);

program.parse();
