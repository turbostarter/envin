"use server";

import { envConfigFilePath } from "@/app/page";
import { parseWithDictionary, type StandardSchemaV1 } from "@/lib/standard";
import { getConfigFile } from "@/utils/get-config-file";

const toIssue = (issue: StandardSchemaV1.Issue) => {
  return {
    message: issue.message,
    path: issue.path,
  };
};

export const validate = async (variables: Record<string, unknown>) => {
  const { config } = await getConfigFile(envConfigFilePath);
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
