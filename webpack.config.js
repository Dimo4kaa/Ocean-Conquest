import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import HtmlWebpackPlugin from 'html-webpack-plugin';
// clearWebpackPlugin

const config = {
  entry: './src/frontend/index.ts',
  // entry: {
  //   frontend: './src/frontend/index.ts',
  //   backend: './src/backend/index.js'
  // },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // clean: true,
  },
  // devServer: {
  //   open: true,
  //   host: "localhost",
  // },
  plugins: [
    // new ESLintWebpackPlugin({
    //   fix: true,
    // }),
    new HtmlWebpackPlugin({
      // filename: "index.html", // название выходного файла
      template: path.resolve(__dirname, './src/frontend/index.html'), // откуда берём шаблон
    }),
    // new ForkTsCheckerWebpackPlugin(),
    // new CopyPlugin({
    // patterns: [{ from: "src/assets", to: "assets" }],
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'src/frontend/tsconfig.json'
          // disable type checker - we will use it in fork plugin
          // transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // {
      //   test: /\.(jpe?g|png|gif|svg)$/i,
      //   loader: 'file-loader',
      //   options: {
      //     name: '/assets/[name].[ext]',
      //   },
      // },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};

export default () => {
  // if (isProduction) {
  //   config.mode = "production";

  //   config.plugins.push(new MiniCssExtractPlugin());
  // } else {
  //   config.mode = "development";
  // }
  config.mode = 'development';
  return config;
};
