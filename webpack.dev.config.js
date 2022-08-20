const path = require('path');
const webpack = require('webpack');
const sourcePath = path.join(__dirname, './src');
const vendorModules = require('./vendorModules');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './src/index.jsx'
    ],
    vendor: vendorModules
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(css|sass|scss)$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    splitChunks: {
      name: 'vendor'
    }
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        production: false
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath
    ]
  },
  output: {
    path: __dirname + "/dev",
    filename: "[name].js",
    publicPath: "/dev"
  }
};