/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (
    /** @type {import('webpack').Configuration & { externals: string[] }} */
    config,
    { isServer }
  ) => {
    if (isServer) {
      config.externals.push("esbuild");
    }

    return config;
  },
};
