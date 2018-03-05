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
 * Defaut target.
 *
 * @type {string}
 */
const defaultLibraryTarget = 'window';

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

export default (env) => {
    env = env || {};

    const { target, fileprefix } = env;
    let filename                 = 'geohash.js';

    if (isProduction && target !== 'umd') {
        filename = 'geohash.min.js';
    } else if (target === 'umd') {
        filename = `${fileprefix}.js`;
    }

    return {
        entry:  resolve(__dirname, main),
        output: {
            library:       'geohash',
            libraryTarget: target || defaultLibraryTarget,
            path:          `${__dirname}/build`,
            filename,
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
        devtool: isProduction || target === 'umd' ? 'none' : 'source-map',
    };
};
