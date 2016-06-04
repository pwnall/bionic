// Karma configuration
var webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: [
      "test/**/*.ts"
    ],
    exclude: [
    ],
    preprocessors: {
      "test/**/*.ts": ["webpack", "sourcemap"]
    },
    webpack: {
      devtool: "source-map",
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
    },
    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true,
      },
    },

    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
    concurrency: Infinity,
  });
};
