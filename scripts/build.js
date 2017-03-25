'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const webpack = require('webpack');
let config = require('../config/webpack.config.prod');
const paths = require('../config/paths');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLockFile);

const hasAppConfig = fs.existsSync(paths.appWebpackConfigProd);

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild);

  // Start the webpack build
  build(previousFileSizes);
});

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production build...');
  let compiler;
  // Merge configurations using webpack-merge default smart strategy
  // https://github.com/survivejs/webpack-merge
  if (hasAppConfig) {
    config = merge.smart(config, require(paths.appWebpackConfigDev))
  }
  try {
    compiler = webpack(config);
  } catch (err) {
    printErrors('Failed to compile.', [err]);
    process.exit(1);
  }

  compiler.run((err, stats) => {
    if (err) {
      printErrors('Failed to compile.', [err]);
      process.exit(1);
    }

    if (stats.compilation.errors.length) {
      printErrors('Failed to compile.', stats.compilation.errors);
      process.exit(1);
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      printErrors(
        'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
        stats.compilation.warnings
      );
      process.exit(1);
    }

    console.log(chalk.green('Compiled successfully.'));
    console.log();

    console.log('File sizes after gzip:');
    console.log();
    // This incorrectly prints the output directory as `build` but its tied up in react-dev-utils
    // and it seems not worth replicating simply to avoid that.
    printFileSizesAfterBuild(stats, previousFileSizes);
    console.log();

    const openCommand = process.platform === 'win32' ? 'start' : 'open';
    const appPackage = require(paths.appPackageJson);
    const buildPath = paths.appBuild.replace(new RegExp(`^${paths.appPath}`), '');
    const publicPath = config.output.publicPath;
    const publicPathname = url.parse(publicPath).pathname;
    console.log(
      `Build complete in ${chalk.green(buildPath)} assuming they'll be served from ${chalk.green(publicPath)}.`
    );
    console.log();
  });
}