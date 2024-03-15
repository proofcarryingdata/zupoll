module.exports = {
  reactStrictMode: false,
  transpilePackages: [],
  compiler: {
    styledComponents: true
  },
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false
    };
    return config;
  }
};
