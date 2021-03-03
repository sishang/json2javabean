const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'json2javabean.js',
    library: {
      root: 'json2java',
      commonjs: 'json2java',
      amd: 'json2java'
    },
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }]
  }
}
