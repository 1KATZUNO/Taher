module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // El plugin de worklets/reanimated DEBE ir de último
      "react-native-worklets/plugin",
    ],
  };
};
