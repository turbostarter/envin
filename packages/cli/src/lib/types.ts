import type { DefineEnv, EnvOptions } from "envin/types";

export interface ErrorObject {
  name: string;
  stack: string | undefined;
  cause: unknown;
  message: string;
}

export const VariableGroup = {
  SHARED: "shared",
  SERVER: "server",
  CLIENT: "client",
} as const;

export type VariableGroup = (typeof VariableGroup)[keyof typeof VariableGroup];

export const DEFAULT_PRESET = "root";

export interface Variable {
  preset: string;
  group: VariableGroup;
  default: string | undefined;
  files: string[];
  description: string | undefined;
}

export type Variables = Record<string, Variable>;

export interface VariableWithKey extends Variable {
  key: string;
}

export interface Config {
  options: EnvOptions;
  env: DefineEnv;
}
