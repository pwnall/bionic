module.exports = {
  entry: "./src/index.ts",
  output: {
    path: __dirname + "/lib",
    filename: "index.js",
    library: true,
    libraryTarget: "commonjs2",
  },
  devtool: "source-map",
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modulesDirectories: ['node_modules'],
  },
  module: {
    preLoaders: [
      { test: /\.ts$/, loader: "tslint-loader" },
    ],
    loaders: [
      { test: /\.ts$/, loader: "ts-loader" },
    ],
  },
};
