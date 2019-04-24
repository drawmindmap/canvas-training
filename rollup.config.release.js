import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import { terser } from 'rollup-plugin-terser';
import simplevars from 'postcss-simple-vars';

export default {
  input: 'src/index.js',
  output: {
    file: 'docs/js/bundle-iife.js',
    name: 'test',
    format: 'iife',
  },
  plugins: [
    json(),
    postcss({
      plugins: [
        simplevars(),
      ],
      extensions: ['.css'],
    }),
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/env',
          {
            // https://github.com/babel/babel/issues/9751
            corejs: 2,
            // https://babeljs.io/docs/en/babel-preset-env
            useBuiltIns: 'usage',
            modules: false,
          },
        ],
      ],
    }),
    // terser(),
  ],
};
