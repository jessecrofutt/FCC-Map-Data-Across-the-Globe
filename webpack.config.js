const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    "./app/app" // Your appʼs entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || "source-map",
  output: {
    path: path.join(__dirname, "public"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: ["", ".js"]
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loaders: ["babel?presets[]=es2015"]
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.(jpg|png)$/,
        loader: 'url-loader',
        options: {
          name: '[path][name].[hash].[ext]',
        },
      },
      {
        test: /\.(css|sass)$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }

    ],
    rules: [
        {
            test: /\.json$/,
            use: 'json-loader'
        }
    ]

  },
  devServer: {
    contentBase: "./build",
    noInfo: false, //  --no-info option
    hot: true,
    inline: true
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './app/template.html'
    }),
    new webpack.ProvidePlugin({
      d3: 'd3',
      $: 'jquery'
    })
  ]
};
