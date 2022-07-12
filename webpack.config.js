const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const npmMode = process.env.BUILD_MODE === 'npm'
const entry = npmMode ? {
  'index': './src/broswer.js',
} : {
  'index': './src/index.js',
  'background': './src/background.js'
}

module.exports = {
  entry,
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
  ].concat(npmMode ? [] : [
    new CopyPlugin({
      patterns: [
        {
          from: 'src',
          to: '' , 
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/websites/**', '**/broswer.js', '**/download.js'],
          }
        },
      ],
    })
  ])
}