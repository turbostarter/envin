#!/usr/bin/env node
import { program } from "commander";
import packageJson from "../../package.json";
import { dev } from "./commands/dev";

const PACKAGE_NAME = "env-cli";

program
  .name(PACKAGE_NAME)
  .description(
    "A live preview of your environment variables right in your browser"
  )
  .version(packageJson.version);

program
  .command("dev")
  .description("Starts the preview email development app")
  .option("-d, --dir <path>", "Directory with your email templates", "./")
  .option("-p --port <port>", "Port to run dev server on", "3000")
  .action(dev);

program.parse();
