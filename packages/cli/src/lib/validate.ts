"use server";

import { config } from "@/lib/config";
import { parseWithDictionary } from "@/lib/standard";

export const validate = async (variables: Record<string, unknown>) => {
  if (!config?.env._schema) {
    return {
      issues: [],
    };
  }

  if ("~standard" in config.env._schema) {
    return config.env._schema["~standard"].validate(variables);
  }

  return parseWithDictionary(config.env._schema, variables);
};
