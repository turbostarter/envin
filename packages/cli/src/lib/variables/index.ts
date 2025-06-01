import type { TPreset } from "envin/types";
import {
  type Config,
  DEFAULT_PRESET,
  type Variable,
  VariableGroup,
} from "@/lib/types";
import { getDefault } from "./default";
import { getDescription } from "./description";

export const getVariables = (config: Config) => {
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
    files: [".env"],
  };
};
