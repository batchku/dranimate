var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var path = require('path');

var webpackConfig = {
  entry: {
    // TODO: create entrypoints for polyfills (if necessary) and vendor (see index.html)
    // polyfills: 'path/to/polyfill/entrypoint',
    // vendor: 'path/to/vendor/entrypoint',
    main: './index.js'
  },
  output: {
    publicPath: '',
    path: path.resolve(__dirname, './dist'),
  },
  // plugins: [
  // new webpack.optimize.CommonsChunkPlugin({ // TODO: code seperation if multiple bundles are used
  //   name: ['main', 'vendor', 'polyfills']
  // }),
  // ],
  module: {
    rules: [
      {
        test: /\.exec\.js$/,
        exclude: /node_modules/,
        use: [ 'script-loader' ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          'raw-loader',
          'postcss-loader',
        ]
      },
      {
        test: /\.html$/,
        loaders: ['raw-loader']
      },
      {
        test: /\.(png|jpg)$/,
        loaders: ['url-loader?limit=8192']
      }
    ]
  }
};

var defaultConfig = {
  devtool: 'source-map',

  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    extensions: [ '.js' ],
    modules: [ path.resolve(__dirname, 'node_modules') ],
  },

  devServer: {
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    port: 3000
    // To access dev server from other devices on the network uncomment the following line
    // ,host: '0.0.0.0', disableHostCheck: true
  },

  node: {
    global: true,
    crypto: 'empty',
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: false,
    clearImmediate: false,
    setImmediate: false
  }
};

module.exports = webpackMerge(defaultConfig, webpackConfig);
