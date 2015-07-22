var webpack = require("webpack");
var	path = require("path");

module.exports = {
	entry: path.resolve(__dirname, "src/index.jsx"),
	output: {
		library: "ReactD3",
		libraryTarget: "umd",

		// path: path.resolve(__dirname, "dist"),
		path: '/Users/mukesh/Documents/pp-main/frontend/harmony/src/pp/shared/vendor',
		filename: "react-d3-components.js"
	},
	module: {
		loaders: [
			{
				test: /.jsx$/, loader: 'babel-loader'
			}
		]
	},
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
	},
	externals: {
		d3: 'pp/shared/vendor/d3',
		react: 'vendor/react'
	},
	devtool: 'eval'
};
