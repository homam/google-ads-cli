const path = require('path');
const nodeExternals = require('webpack-node-externals');

console.log("the __dirname is: " + __dirname);

module.exports = {
  entry: "./src/index.ts",
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist/js")
  },
  target: "node",
  externals: [nodeExternals()],
  mode: "production",
  module: {
    rules: [{
      test: /\.js|\.ts$/,
      exclude: /(node_modules)/,
      use: {
        loader: "babel-loader"
      }
    }
    ]
  }
}