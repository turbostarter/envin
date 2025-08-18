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

export const Status = {
  ALL: "all",
  VALID: "valid",
  INVALID: "invalid",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const Environment = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

export const DEFAULT_PRESET = "root";

export const FILES = {
  [Environment.DEVELOPMENT]: [".env", ".env.development", ".env.local"],
  [Environment.PRODUCTION]: [
    ".env",
    ".env.production",
    ".env.local",
    ".env.production.local",
  ],
} as const;

export interface Variable {
  preset: {
    id: string;
    path: string[];
  };
  group: VariableGroup;
  default: string | undefined;
  description: string | undefined;
}

export type Variables = Record<string, Variable>;

export interface FileValue {
  value: string | undefined;
  files: string[];
}

export type FileValues = Record<string, FileValue>;

export interface VariableWithKey extends Variable {
  key: string;
}

export interface Config {
  options: EnvOptions;
  env: DefineEnv;
}
