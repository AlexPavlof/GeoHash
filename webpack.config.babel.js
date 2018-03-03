/* eslint-disable no-console */
import { resolve }    from 'path';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import { main }       from './package.json';

/**
 * Environement value means production mode.
 *
 * @type {string}
 */
const prodEnv = 'production';

/**
 * True if buld running in production mode.
 *
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === prodEnv;

/**
 * Plugins.
 *
 * @type {*[]}
 */
const plugins = [];

if (isProduction) {
    plugins.push(new UglifyJSPlugin({
        uglifyOptions: {
            mangle: {
                reserved: ['$super', '$', 'exports', 'require'],
            },
            output: {
                comments: false,
                beautify: false,
            },
            cache:     true,
            parallel:  4,
            sourceMap: !isProduction,
        },
    }));
}

export default () => ({
    entry:  resolve(__dirname, main),
    output: {
        library:       'geohash',
        libraryTarget: 'window',
        path:          __dirname,
        filename:      isProduction ? 'build/geohash.min.js' : 'build/geohash.js',
    },
    mode:   isProduction ? prodEnv : 'development',
    cache:  true,
    plugins,
    module: {
        rules: [
            {
                test:    /\.js?$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
            },
        ],
    },
    devtool: isProduction ? 'none' : 'source-map',
});
