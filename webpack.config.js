const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Handle WASM modules for expo-sqlite
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'webassembly/async',
  });

  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
    layers: true,
  };

  // Add output.module if needed for WASM support
  if (!config.output.module) {
    config.output.module = false;
  }

  return config;
};
