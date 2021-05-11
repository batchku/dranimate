const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
	context: path.resolve(__dirname, 'src'),
	entry: {
		main: './index.tsx'
	},
	output: {
		filename: '[name].bundle.js',
		sourceMapFilename: '[name].map',
		chunkFilename: '[id].chunk.js',
		path: path.resolve(__dirname, './dist'),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			filename: 'index.html',
		})
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: [path.resolve(__dirname, 'node_modules')],
		alias: {
			components: path.resolve(__dirname, 'src/components/'),
			services: path.resolve(__dirname, 'src/services/'),
			styles: path.resolve(__dirname, 'src/styles/'),
			icons: path.resolve(__dirname, 'src/icons'),
		}
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.(t|j)sx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader'
					},
				]
			},
			{
				enforce: "pre",
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "source-map-loader"
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /dranimate-fast\.wasm$/,
				type: "javascript/auto",
				loader: "file-loader",
				options: {
					name: "wasm/dranimate-fast.wasm"
				}
			},
			{
				test: /\.(vert|frag)$/,
				use: 'raw-loader',
			},
		]
	},

	devServer: {
		https: false,
		historyApiFallback: true,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
		},
		port: 5000,
		host: 'localhost',
		disableHostCheck: true
	},
};

module.exports = webpackConfig;
