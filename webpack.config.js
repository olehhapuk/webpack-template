const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const paths = {
  src: path.resolve(__dirname, 'src'),
  components: path.resolve(__dirname, 'src', 'components'),
  layouts: path.resolve(__dirname, 'src', 'layouts'),
  js: path.resolve(__dirname, 'src', 'js'),
  scss: path.resolve(__dirname, 'src', 'scss'),
  views: path.resolve(__dirname, 'src', 'views'),
  dist: path.resolve(__dirname, 'dist'),
};

const entries = fs.readdirSync(paths.js).reduce((acc, filename) => {
  const name = filename.replace(/\.js/, '');
  const path = `${paths.js}/${filename}`;

  return {
    ...acc,
    [name]: path,
  };
}, {});

const views = fs
  .readdirSync(paths.views)
  .filter((filename) => filename.endsWith('.pug'));

module.exports = {
  mode: process.env.NODE_ENV,
  entry: entries,
  output: {
    filename: '[name].js',
    path: paths.dist,
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    contentBase: paths.dist,
    port: 3000,
    overlay: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
    new MiniCssExtractPlugin(),
    ...views.map(
      (view) =>
        new HtmlWebpackPlugin({
          template: `${paths.views}/${view}`,
          filename: `./${view.replace(/\.pug/, '.html')}`,
          chunks: [view.replace(/\.pug/, '')],
        })
    ),
    new FriendlyErrorsWebpackPlugin(),
  ],
};
