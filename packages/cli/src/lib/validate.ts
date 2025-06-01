"use server";

import { config } from "@/lib/config";
import { parseWithDictionary, type StandardSchemaV1 } from "@/lib/standard";

const toIssue = (issue: StandardSchemaV1.Issue) => {
  return {
    message: issue.message,
    path: issue.path,
  };
};

export const validate = async (variables: Record<string, unknown>) => {
  if (!config?.env._schema) {
    return {
      issues: [],
    };
  }

  if ("~standard" in config.env._schema) {
    const result = await config.env._schema["~standard"].validate(variables);

    return {
      issues: result.issues?.map(toIssue) ?? [],
    };
  }

  const result = parseWithDictionary(config.env._schema, variables);

  return {
    issues: result.issues?.map(toIssue) ?? [],
  };
};
