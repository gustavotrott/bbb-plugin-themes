/* eslint-disable @typescript-eslint/no-var-requires */
// Builds every theme in themes/ into dist/<theme>/: <Library>.js + manifest.json.
// Build only some of them with: npx webpack --mode production --env themes=cozy,kids
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');

const all = fs.readdirSync(path.resolve(__dirname, 'themes'))
  .filter((t) => fs.existsSync(path.resolve(__dirname, 'themes', t, 'manifest.json')));

module.exports = (env = {}) => {
  const themes = env.themes ? env.themes.split(',') : all;
  return themes.map((theme) => {
    const dir = path.resolve(__dirname, 'themes', theme);
    const { name } = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    return {
      name: theme,
      entry: path.join(dir, 'index.tsx'),
      output: {
        path: path.resolve(__dirname, 'dist', theme),
        filename: `${name}.js`,
        library: name,
        libraryTarget: 'umd',
        publicPath: '/',
        globalObject: 'this',
        clean: true,
      },
      module: {
        rules: [
          { test: /\.css$/, use: ['style-loader', 'css-loader'] },
          // Icons and backgrounds go inline as data URIs, so each theme is a single JS file
          { test: /\.svg$/, type: 'asset/inline' },
          { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
        ],
      },
      resolve: { extensions: ['.js', '.jsx', '.tsx', '.ts'] },
      plugins: [
        new CopyWebpackPlugin({ patterns: [{ from: path.join(dir, 'manifest.json'), to: './' }] }),
      ],
      performance: { hints: false },
    };
  });
};
