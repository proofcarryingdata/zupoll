module.exports = {
  reactStrictMode: false,
  transpilePackages: [],
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
