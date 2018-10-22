import flow       from 'rollup-plugin-flow';
import babel      from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { eslint } from 'rollup-plugin-eslint';
import pkg        from './package.json';

const plugins = [
    eslint(),
    flow(),
    babel({
        exclude: 'node_modules/**',
    }),
];
let outputs = [{
    file:    pkg.main,
    name:    pkg.name,
    exports: 'named',
    format:  'umd',

}, {
    file:   pkg.module,
    format: 'es',

}];

if (process.env.BUILD === 'production') {
    plugins.push(uglify());

    outputs = {
        file:    `build/${pkg.name}.min.js`,
        name:    pkg.name,
        exports: 'named',
        format:  'umd',
    };
}

export default {
    input:  `src/${pkg.name}.js`,
    output: outputs,
    plugins,
};
