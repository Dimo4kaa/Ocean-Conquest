import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => {
  const mode = env.mode === 'dev' ? 'development' : 'production';

  return {
    entry: path.resolve(__dirname, 'src', 'frontend', 'index.ts'),
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      clean: mode === 'development' ? false : true,
    },
    devtool: mode === 'development' ? 'source-map' : false, //чтоб работали sourceMaps в MiniCssExtractPlugin
    mode: mode,
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'frontend', 'index.html'),
      }),
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'src', 'frontend', 'assets'), to: path.resolve(__dirname, 'dist', 'assets') },
        ],
      }),
      new MiniCssExtractPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'src', 'frontend', 'tsconfig.json'),
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {sourceMap: true},
            },
            {
              loader: 'sass-loader',
              options: {sourceMap: true},
            },
          ]
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};
