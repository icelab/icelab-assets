'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const atImport = require('postcss-import');
const cssNext = require('postcss-cssnext');
const modulesValues = require('postcss-modules-values');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const path = require('path');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we serve from the full domain we’re booting the app on.
const protocol = process.env.ASSETS_HTTPS === 'true' ? 'https' : 'http';
const host = process.env.ASSETS_HOST || 'localhost';
const port = parseInt(process.env.ASSETS_PORT, 10) || 8080;
const serverBase = `${protocol}://${host}:${port}`;
const publicPath = `${serverBase}${paths.publicPath}`;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// Get environment variables to inject into our app.
const env = getClientEnvironment();

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  // Specify the context we expect app code to be loaded from
  context: paths.appSrc,
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // We can have multiple entries and so we merge them with some common values to
  // enable "hot" CSS and auto-refreshes for JS.
  entry: paths.appEntries.reduce((output, entry) => {
    const [name, location] = entry
    output[name] = [
      // Add our custom dev niceties:
      // - Supressing the output of the webpack-dev-server and hot-module-resolveLoader
      //   in the console. No more [WDS] and [MHR] messages.
      // - Automatically reloading extracted CSS
      require.resolve('./devNiceties'),
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // the line below with these two lines if you prefer the stock client:
      require.resolve('webpack-dev-server/client') + `?${serverBase}`,
      require.resolve('webpack/hot/dev-server'),
      // We ship a few polyfills by default:
      require.resolve('./polyfills'),
      // Finally, this is where the code lives for this entry
      location,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ]
    return output
  }, {}),
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce real files. It's just the virtual path that is
    // served by WebpackDevServer in development.
    filename: "[name].js",
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules'].concat(paths.nodePaths),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    extensions: ['.js', '.json', '.jsx'],
    alias: {
      'formalist-theme': path.resolve(paths.appNodeModules, 'formalist-standard-react/lib/components/ui')
    },
  },
  // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
  // directory of `react-scripts` itself rather than the project directory.
  resolveLoader: {
    modules: [
      paths.ownNodeModules,
      paths.appNodeModules,
    ],
  },
  module: {
    rules: [
      // Disable require.ensure as it's not a standard language feature.
      { parser: { requireEnsure: false } },
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      // {
      //   test: /\.(js|jsx)$/,
      //   enforce: 'pre',
      //   use: [
      //     {
      //       // @remove-on-eject-begin
      //       // Point ESLint to our predefined config.
      //       options: {
      //         configFile: path.join(__dirname, '../eslintrc'),
      //         useEslintrc: false,
      //       },
      //       // @remove-on-eject-end
      //       loader: 'eslint-loader',
      //     },
      //   ],
      //   include: paths.appSrc,
      // },
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list for "url" loader.

      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.css$/,
          /\.mcss$/,
          /\.json$/,
          /\.bmp$/,
          /\.gif$/,
          /\.jpe?g$/,
          /\.png$/,
        ],
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[path][name].[ext]',
        },
      },
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: {
          // @remove-on-eject-begin
          babelrc: false,
          presets: [require.resolve('babel-preset-react-app')],
          // @remove-on-eject-end
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
        },
      },
      // Handle loading CSS Modules files
      {
        test: /\.mcss$/,
        loader: ExtractTextPlugin.extract(
          Object.assign(
            {
              fallback: 'style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                    modules: true,
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                    plugins: () => [
                      // Expand @values from CSS Modules (we use these in formalist-standard-react)
                      modulesValues,
                      // Add module-like @import support to our CSS. This sets the context for all imports
                      // to be the base entry point.
                      atImport(),
                      // cssnext gives us compilation of future-CSS syntax, it also includes autoprefixer
                      // so we don't need to add that separately.
                      cssNext({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9', // React doesn't support IE8 anyway
                        ],
                      }),
                    ],
                  },
                },
              ],
            },
            extractTextPluginOptions
          )
        ),
      },
      // The notation here is somewhat confusing.
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader normally turns CSS into JS modules injecting <style>,
      // but unlike in development configuration, we do something different.
      // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
      // (second argument), then grabs the result CSS and puts it into a
      // separate file in our build process. This way we actually ship
      // a single CSS file in production instead of JS code injecting <style>
      // tags. If you use code splitting, however, any async bundles will still
      // use the "style" loader inside the async code so CSS from them won't be
      // in the main CSS file.
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          Object.assign(
            {
              fallback: 'style-loader',
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                  },
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                    plugins: () => [
                      // Add module-like @import support to our CSS. This sets the context for all imports
                      // to be the base entry point.
                      atImport(),
                      // cssnext gives us compilation of future-CSS syntax, it also includes autoprefixer
                      // so we don't need to add that separately.
                      cssNext({
                        browsers: [
                          '>1%',
                          'last 4 versions',
                          'Firefox ESR',
                          'not ie < 9', // React doesn't support IE8 anyway
                        ],
                      }),
                    ],
                  },
                },
              ],
            },
            extractTextPluginOptions
          )
        ),
        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
      },
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ],
  },
  plugins: [
    // Friendlier error messages
    new FriendlyErrorsWebpackPlugin(),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
    new ExtractTextPlugin({
      filename: '[name].css',
    }),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};