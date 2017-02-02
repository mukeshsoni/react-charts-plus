var myArgs = require('optimist').argv
var webpack = require("webpack");
var	path = require("path");
var distPath = path.resolve(__dirname, "dist");
var externals = {d3: true, react: 'React'};

if(myArgs.dist) {
	distPath = path.resolve(myArgs.dist);
}

if(myArgs.work) {
  externals = {
    'd3': 'd3',
    'react': 'React',
    'react-dom': 'ReactDOM'
  };
}

module.exports = {
	entry: path.resolve(__dirname, "src/index.jsx"),
	output: {
		library: "ReactD3",
		libraryTarget: "umd",
		path: distPath,
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
	externals: externals,
	devtool: 'eval'
};
