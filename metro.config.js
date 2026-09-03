const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Keep Expo's defaults and explicitly teach Metro about production 3D assets.
// GLB/glTF files remain ordinary bundled assets; the renderer layer owns
// loading and interpreting them after the Cassidy production package passes
// validation.
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'glb', 'gltf']),
);

module.exports = withNativeWind(config, { input: './global.css' });
