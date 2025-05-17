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

export const isBuilding = process.env.NEXT_PUBLIC_IS_BUILDING === "true";

export const isPreviewDevelopment =
  process.env.NEXT_PUBLIC_IS_PREVIEW_DEVELOPMENT === "true";
