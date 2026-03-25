const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the monorepo root so Metro can resolve hoisted packages
config.watchFolders = [monorepoRoot];

// 2. Tell Metro where to look for node_modules (local first, then root)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. FORCE deduplicate react & react-native using resolveRequest
//    extraNodeModules is only a fallback - resolveRequest actually overrides
const reactNativeModules = new Set(["react", "react-native", "react/jsx-runtime", "react/jsx-dev-runtime"]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force react-related modules to resolve from monorepo root
  if (reactNativeModules.has(moduleName)) {
    return {
      filePath: require.resolve(moduleName, { paths: [monorepoRoot] }),
      type: "sourceFile",
    };
  }
  // Everything else uses default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
