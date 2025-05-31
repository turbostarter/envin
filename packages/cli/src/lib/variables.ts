import type { TPreset } from "envin/types";
import { z } from "zod";
import type { StandardSchemaV1 } from "@/lib/standard";
import {
  type Config,
  DEFAULT_PRESET,
  type Variable,
  VariableGroup,
} from "@/lib/types";

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
    default: getDefaultValue(schema),
    files: [".env"],
  };
};

const descriptionSchema = z.object({
  description: z.string().optional(),
});

const getDescription = (schema: StandardSchemaV1) => {
  const result = descriptionSchema.safeParse(schema);

  if (result.success) {
    return result.data.description;
  }

  return undefined;
};

const defaultValueSchema = z.object({
  _def: z.object({
    defaultValue: z.function().optional(),
  }),
});

const getDefaultValue = (schema: StandardSchemaV1) => {
  const result = defaultValueSchema.safeParse(schema);

  if (result.success) {
    return result.data._def.defaultValue?.() as string | undefined;
  }

  return undefined;
};
