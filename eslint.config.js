// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // react-three-fiber elements take Three.js props (args, position, emissive…) that the DOM rule doesn't know.
    files: ['src/three/**'],
    rules: { 'react/no-unknown-property': 'off' },
  },
]);
