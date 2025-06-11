import { defineEnv } from "envin";

/**
 * Change the import to the validator you want to use.
 */

// import { config } from "./validators/valibot";
// import { config } from "./validators/arktype";
import { config } from "./validators/zod";

export default defineEnv(config.v4);
