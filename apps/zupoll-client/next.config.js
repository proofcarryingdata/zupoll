module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@pcd/passport-interface"],
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
};
