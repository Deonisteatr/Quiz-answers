const  HtmlWebpackPlugin  =  require ( "html-webpack-plugin" ) ;
const path = require('path');
const  CopyPlugin  =  require ( "copy-webpack-plugin" ) ;
const  { CleanWebpackPlugin }  =  require ( 'clean-webpack-plugin' ) ;

module.exports = {
    entry: './src/app.js',
    mode: "development",
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        static: '.dist',
        compress: true,
        port: 9002,
    },
    plugins : [
        new HtmlWebpackPlugin ( {
        template: './index.html',
    }),
        new CopyPlugin ( {
            patterns : [
                { from : "templates" , to : "templates" },
                { from : "css" , to : "css" },
                { from : "static/fonts" , to : "static/fonts" },
                { from : "static/image" , to : "static/image" },
            ],
        }),
        new  CleanWebpackPlugin ( ) ,
    ],
    // module: {
    //     rules: [
    //         {
    //             test: /\.js$/,
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: 'babel-loader',
    //                 options: {
    //                     targets: "defaults",
    //                     presets: [
    //                         ['@babel/preset-env']
    //                     ]
    //                 }
    //             }
    //         }
    //     ]
    // }
};