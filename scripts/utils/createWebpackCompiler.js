'use strict';

const chalk = require('chalk');
const webpack = require('webpack');

const isInteractive = process.stdout.isTTY;
let handleCompile;

module.exports = function createWebpackCompiler(config, onReadyCallback) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  let compiler;
  try {
    compiler = webpack(config, handleCompile);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  let isFirstCompile = true;

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', stats => {
    if (typeof onReadyCallback === 'function') {
      onReadyCallback(isFirstCompile);
    }
    isFirstCompile = false;
  });

  return compiler;
};