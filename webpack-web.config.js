//@ts-check
'use strict';

const { join } = require('path');
const webpack = require('webpack');

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const webExtensionConfig = {
  mode: 'none',
  target: 'webworker',
  entry: {
    extension: './src/web/extension.ts',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'test/suite/index': './src/web/test/suite/index.ts',
  },
  output: {
    filename: '[name].js',
    path: join(__dirname, './dist/web'),
    libraryTarget: 'commonjs',
    devtoolModuleFilenameTemplate: '../../[resource-path]',
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.js'],
    fallback: {
      assert: require.resolve('assert'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  externals: {
    vscode: 'commonjs vscode',
  },
  performance: {
    hints: false,
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: 'log',
  },
};

module.exports = [webExtensionConfig];
