const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  entry: {
    'index': './src/index.js',
    'background': './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                'corejs': 2,
                'helper': true,
                'regenerator': true,
                'useESModules': false
              }
            ]
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src', to: '' },
      ],
    }),
  ]
}