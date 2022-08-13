const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
module.exports = {
    entry: {
        app: './src/vrdesktop.ts'
    },
    output: {
        path: path.resolve(appDirectory, 'www'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "www"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        },
        proxy:{
            '/socket':{
                target:'ws://localhost:8081',
                secure:false,
                ws: true
            }
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            template: path.resolve(appDirectory, "www/index.html"),
        })
    ],
    mode:"development",
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    }
}