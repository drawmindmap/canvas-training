import json from 'rollup-plugin-json';
import postcss from 'rollup-plugin-postcss';
import simplevars from 'postcss-simple-vars';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'docs/js/bundle.js',
    format: 'es',
  },
  plugins: [
    json(),
    postcss({
      plugins: [
        simplevars(),
      ],
      extensions: ['.css'],
    }),
    resolve({
      // pass custom options to the resolve plugin
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
  ],
  watch: {
    include: 'src/**',
  },
};
