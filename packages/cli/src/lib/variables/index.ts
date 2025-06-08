"use server";

import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import type { TPreset } from "envin/types";
import { envDirectoryAbsolutePath } from "@/app/env";
import {
  type Config,
  DEFAULT_PRESET,
  Environment,
  FILES,
  type FileValues,
  type Variable,
  VariableGroup,
} from "@/lib/types";
import { getDefault } from "./default";
import { getDescription } from "./description";

export const getVariables = async (config: Config) => {
  if (!config) {
    return {};
  }

  const variables = {};
  const schema = config.env._schema;

  const presets = [
    ...(config.options.extends ?? []),
    {
      id: DEFAULT_PRESET,
      ...config.options,
    },
  ];

  for (const key of Object.keys(schema)) {
    for (const preset of presets) {
      const variable = getVariable(key, preset);

      if (variable) {
        variables[key] = variable;
      }
    }
  }

  return variables;
};

const getVariableGroup = (key: string, preset: TPreset) => {
  if (preset.shared && key in preset.shared) {
    return {
      group: VariableGroup.SHARED,
      schema: preset.shared[key],
    };
  }

  if (preset.server && key in preset.server) {
    return {
      group: VariableGroup.SERVER,
      schema: preset.server[key],
    };
  }

  if (preset.client && key in preset.client) {
    return {
      group: VariableGroup.CLIENT,
      schema: preset.client[key],
    };
  }

  return null;
};

const getVariable = (key: string, preset: TPreset): Variable | null => {
  const keys = new Set([
    ...Object.keys(preset.shared ?? {}),
    ...Object.keys(preset.client ?? {}),
    ...Object.keys(preset.server ?? {}),
  ]);

  if (!keys.has(key)) {
    return null;
  }

  const info = getVariableGroup(key, preset);

  if (!info) {
    return null;
  }

  const { group, schema } = info;

  return {
    description: getDescription(schema),
    preset: preset.id ?? "",
    group,
    default: getDefault(schema),
  };
};

const getFiles = () => {
  return Object.fromEntries(
    Object.entries(FILES).map(([environment, files]) => [
      environment,
      files.map((file) => {
        try {
          return parse(
            readFileSync(
              path.join(envDirectoryAbsolutePath ?? "", file),
              "utf8",
            ),
          );
        } catch {
          return {};
        }
      }),
    ]),
  );
};

export const getFileValues = async (
  environment: Environment = Environment.DEVELOPMENT,
): Promise<FileValues> => {
  const files = getFiles();
  const variablesFromFiles = files[environment];

  const result: FileValues = {};

  variablesFromFiles?.forEach((file, index) => {
    const fileName = FILES[environment][index] ?? "";

    Object.entries(file).forEach(([key, value]) => {
      if (!result[key]) {
        result[key] = {
          value,
          files: [fileName],
        };
      } else {
        result[key] = {
          ...result[key],
          value,
          files: [...result[key].files, fileName],
        };
      }
    });
  });

  return result;
};
