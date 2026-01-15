/** ONLY ACCESSIBLE ON THE SERVER */
// biome-ignore lint/style/noNonNullAssertion: always set
export const envDirRelativePath = process.env.ENV_DIR_RELATIVE_PATH!;

/** ONLY ACCESSIBLE ON THE SERVER */
// biome-ignore lint/style/noNonNullAssertion: always set
export const userProjectLocation = process.env.USER_PROJECT_LOCATION!;

/** ONLY ACCESSIBLE ON THE SERVER */
export const envDirectoryAbsolutePath =
  // biome-ignore lint/style/noNonNullAssertion: always set
  process.env.ENV_DIR_ABSOLUTE_PATH!;

const parseJsonArray = (raw: string | undefined) => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** ONLY ACCESSIBLE ON THE SERVER */
export const envDirectoryAbsolutePaths =
  parseJsonArray(process.env.ENV_DIR_ABSOLUTE_PATHS) ??
  (envDirectoryAbsolutePath ? [envDirectoryAbsolutePath] : []);

/** ONLY ACCESSIBLE ON THE SERVER */
export const envFilePaths = parseJsonArray(process.env.ENV_FILE_PATHS);

/** ONLY ACCESSIBLE ON THE SERVER */
export const envConfigPath = process.env.ENV_CONFIG_PATH ?? "";

export const isBuilding = process.env.NEXT_PUBLIC_IS_BUILDING === "true";

export const isPreviewDevelopment =
  process.env.NEXT_PUBLIC_IS_PREVIEW_DEVELOPMENT === "true";
