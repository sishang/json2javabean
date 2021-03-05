const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: "main.js",
    library: 'json2java',
    libraryTarget: "umd",
    libraryExport: "default",
    globalObject: "typeof self !== 'undefined' ? self : typeof windows !== 'undefined' ? window : typeof global !== 'undefined' ? global : this"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }]
  },
  devtool: 'source-map'
}
