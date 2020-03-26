const path = require('path');

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
	context: path.resolve(__dirname, 'src'),
	entry: {
		vendor: './_entrypoints/vendor.js',
		main: './_entrypoints/main.js'
	},
	output: {
		publicPath: '',
		path: path.resolve(__dirname, './dist'),
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: ['main', 'vendor']
		}),
		new HtmlWebpackPlugin({
			template: 'index.html',
			filename: 'index.html',
			inject: 'body'
		}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'node_modules/gif.js/dist/gif.worker.js'),
				to: 'workers/gif.worker.js'
			}
		])
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader'
					},
				]
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		]
	}
};

const defaultConfig = {
	devtool: 'source-map',

	output: {
		filename: '[name].bundle.js',
		sourceMapFilename: '[name].map',
		chunkFilename: '[id].chunk.js'
	},

	resolve: {
		extensions: [ '.js' ],
		modules: [ path.resolve(__dirname, 'node_modules') ],
		alias: {
			components: path.resolve(__dirname, 'src/components/'),
			services: path.resolve(__dirname, 'src/services/'),
			styles: path.resolve(__dirname, 'src/styles/'),
		}
	},

	devServer: {
		https: true,
		historyApiFallback: true,
		watchOptions: { aggregateTimeout: 300, poll: 1000 },
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
		},
		port: 5000
		// To access dev server from other devices on the network uncomment the following line
		,host: '0.0.0.0', disableHostCheck: true
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
