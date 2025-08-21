import {
  DEFAULT_PRESET,
  type VariablePreset,
  type Variables,
} from "@/lib/types";

const PRESET_LABEL_DELIMITER = "#";

const toPresetPathString = (preset: VariablePreset | undefined) => {
  return preset?.path.join(".") ?? DEFAULT_PRESET;
};

export const groupVariablesByPreset = (
  variables: Variables,
  keys?: string[],
) => {
  const sections = Object.groupBy(
    (keys ?? Object.keys(variables)).map((key) => {
      return {
        ...variables[key],
        key,
      };
    }),
    ({ preset }) => toPresetPathString(preset),
  );

  const presets = Object.fromEntries(
    (keys ?? Object.keys(variables)).map((key) => [
      toPresetPathString(variables[key]?.preset),
      variables[key]?.preset,
    ]),
  );

  return {
    sections,
    presets,
  };
};

export const getVariablePresetLabel = (preset: VariablePreset) => {
  const repeatCount = preset.path.length + 1;
  return `${PRESET_LABEL_DELIMITER.repeat(repeatCount)} ${preset.id.toUpperCase()} ${PRESET_LABEL_DELIMITER.repeat(repeatCount)}`;
};
