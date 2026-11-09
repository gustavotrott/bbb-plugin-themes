/* eslint-disable @typescript-eslint/no-var-requires */
// Builds the plugin with every theme in themes/ into dist/: BbbPluginThemes.js + manifest.json.
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const { name } = require('./manifest.json');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${name}.js`,
    library: name,
    libraryTarget: 'umd',
    publicPath: '/',
    globalObject: 'this',
    clean: true,
  },
  module: {
    rules: [
      // Stylesheets come in as strings: the plugin injects and swaps the theme sheets itself
      { test: /\.css$/, use: [{ loader: 'css-loader', options: { exportType: 'string' } }] },
      // Icons and backgrounds go inline as data URIs, so the plugin is a single JS file
      { test: /\.svg$/, type: 'asset/inline' },
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  resolve: { extensions: ['.js', '.jsx', '.tsx', '.ts'] },
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from: path.resolve(__dirname, 'manifest.json'), to: './' }] }),
  ],
  performance: { hints: false },
};
