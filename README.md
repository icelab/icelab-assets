# Icelab Assets

An opinionated asset setup for Icelab projects.

## Installation

Add `icelab-assets` as a `devDependency` to your app with one of the below tasks:

```
npm install --save-dev icelab/icelab-assets
yarn add --dev icelab/icelab-assets
```

Then add this config to the `scripts` section of your `package.json` file:

```
"scripts": {
  "start": "icelab-assets start",
  "build": "icelab-assets build",
  "test": "icelab-assets test",
  "create-entry": "icelab-assets create-entry"
}
```

## Usage

Once you’re set up, you’ll have four tasks available that you can run with either `npm run` or `yarn run`:

* `start` will boot a development server at <http://localhost:8080> which will watch your asset files and rebuild on the fly.
* `build` will create a production-ready build for each of your asset entry points.
* `test` will use [jest](https://facebook.github.io/jest/) to run the tests for your assets.
* `create-entry` allows you to create a new asset entry point at a directory path: `yarn run create-entry apps/path/to/the/entry`

By default, `icelab-assets` looks for asset entry points at `apps/**/**/entry.js` and will generate a name for that entry based on its parent directories using this basic formula: `apps/:app_name/**/:entry_name/`. Thus, given the following entry points (and assuming they only return JavaScript):

```
apps/admin/assets/admin/entry.js
apps/admin/assets/inline/entry.js
apps/main/assets/public/entry.js
apps/main/assets/nested/deeply/for/some/reason/critical/entry.js
```

These output files would be generated:

```
admin__admin.js
admin__inline.js
main__public.js
main__critical.js
```

Note: entry names that begin with `inline` are assumed to be files that will eventually be included inline in HTML output. These files thus exclude some dev-related niceties like hot-reloading to avoid clogging up the generated HTML.

## Configuration

### Paths

You can override default path options using the following command line args:

* `--source-path` — defaults to `apps`
* `--build-path` — defaults to `public/assets`
* `--public-path` — defaults to `/assets/`

If you were using this in conjunction with WordPress for example, you might do something like:

```json
"scripts": {
  "start": "icelab-assets start --source-path=wp-content/themes",
  "build": "icelab-assets build --source-path=wp-content/themes",
  "test": "icelab-assets test --source-path=wp-content/themes"
}
```

This would traverse within `wp-content/themes` for any `entry.js` files and use them as the entry points for the build.

### Webpack configurations

You can adjust the webpack configuration for either development or production environments by creating a matching config file in the root of your application:

```
webpack.config.dev.js
webpack.config.prod.js
```

If these files exist, they’ll be merged with the default configuration using the default “smart” strategy from [webpack-merge](https://github.com/survivejs/webpack-merge). You’ll need to match the form of the [existing](config/webpack.config.dev.js) [config](config/webpack.config.prod.js) files to get the to merge matching loaders (including the `include` values for example).

Here’s a custom config that’ll add a `foobar` loader to the pipeline for both CSS and JavaScript:

```
var path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // Needs to match the `include` value in the default configuration
        include: path.resolve('apps'),
        use: [{
          loader: 'awesome-loader'
        }]
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'awesome-loader'
        }]
      },
    ],
  }
}
```

This would append the theoretical `awesome-loader` loader to the end of the pipeline in both cases.

## CSS

We post-process CSS using [CSS Next](http://cssnext.io) so all the features listed there are available to us. The top-line niceties are:

* Autoprefixing
* CSS variables
* Nested selectors
* Colour functions

We also add support for importing CSS inline using `@import` via [postcss-import](https://github.com/postcss/postcss-import). Something to note about this is that _all_ references in CSS must be made relative to the root of the current entry — this includes `@import` and `url` references:

```css
/**
 * Given a file structure like:
 *
 * /entry-name
 *   /foo
 *      index.js
 *      image.jpg
 *
 * A reference to `image.jpg` must include the parent path.
 */
.foo {
  background-image: url('foo/image.jpg');
}
```

## JavaScript

### Language features and polyfills

We support a superset of the latest JavaScript standard. In addition to [ES6](https://github.com/lukehoban/es6features) syntax features, we also supports:

* [Exponentiation Operator](https://github.com/rwaldron/exponentiation-operator) (ES2016).
* [Async/await](https://github.com/tc39/ecmascript-asyncawait) (ES2017).
* [Object Rest/Spread Properties](https://github.com/sebmarkbage/ecmascript-rest-spread) (stage 3 proposal).
* [Class Fields and Static Properties](https://github.com/tc39/proposal-class-public-fields) (stage 2 proposal).
* [JSX](https://facebook.github.io/react/docs/introducing-jsx.html) and [Flow](https://flowtype.org/) syntax.

Learn more about [different proposal stages](https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-).

Note that **the project only includes a few ES6 [polyfills](https://en.wikipedia.org/wiki/Polyfill)**:

* [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) via [`object-assign`](https://github.com/sindresorhus/object-assign).
* [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) via [`promise`](https://github.com/then/promise).
* [`fetch()`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) via [`whatwg-fetch`](https://github.com/github/fetch).

If you use any other ES6+ features that need **runtime support** (such as `Array.from()` or `Symbol`), make sure you are including the appropriate polyfills manually, or that the browsers you are targeting already support them.

#### Top-level entry point import resolution

We’ve added support for top-level resolution of `import`ed modules. This means that you can specify an import as though you are at the top-level of each entry. For example:

```js
// Given a file at ./entry-folder/foo/bar/index.js
export default function bar () {
  // ... do something
}
// From entry-folder/foo/index.js we can do a relative call as usual:
import bar from "./bar";
// ... or scope it from the root of the `entry-folder`
import bar from "foo/bar";
```

### Code splitting

We support code splitting in babel using the [syntax-dynamic-import](http://babeljs.io/docs/plugins/syntax-dynamic-import/) plugin which allows you to, as the name suggests, dynamically import modules. Here’s an example:

```js
// determine-date/index.js
export default function determineDate() {
  import('moment')
    .then(moment => moment().format('LLLL'))
    .then(str => console.log(str))
    .catch(err => console.log('Failed to load moment', err));
}

// other-file/index.js
import determineDate from 'determine-date'
determineDate(); // moment won't be loaded until this line is _executed_
```

You can use this method for imports within your application too, they’re not restricted to external modules.

The build process will automatically split any dynamic imports out into separate chunks, and the bundled JavaScript will load them on the fly without you having to do anything more. You may notice them as `0.abc1234.chunk.js` files in your final build. This should mean smaller initial payloads for apps, but it’s worth considering that separate chunks will potentially take time to load, and you’ll need to have your UI sympathetic to that.

### Code linting and formatting

JS code in your source paths will be linted using [eslint](http://eslint.org). We use the base config from create-react-app, which is released as a separate package called [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app), and then add some small adjustments in each environment:

* In development, we include [prettier](https://github.com/prettier/prettier) to enforce a code style across our projects. This integration will automatically format both JS and CSS whenever you change files.
* In production, we do not include prettier so it will not break your builds. We do however add a `no-debugger` rule to ensure that you can’t push production code that includes debugging lines.

If you’re using an eslint plugin/extension in your editor, you’ll need to configure it to read the `icelab-assets` configuration as its hidden within the package. For Visual Studio code you can add a workspace-specific configuration that looks like this:

```js
// .vscode/settings.json
// Place your settings in this file to overwrite default and user settings.
{
  // Custom eslint config
  "eslint.options": {
    "configFile": "./node_modules/icelab-assets/eslintrc"
  },
  "eslint.nodePath":  "./node_modules/icelab-assets/node_modules"
}
```

Once that’s integrated, you should be able to use eslint’s "Fix all auto-fixable problems" command to fix and format your code with prettier.

## PhantomJS usage

There are some dev-related packages injected into the development build that aren’t relevant in testing environments and these can cause issues with PhantomJS. If you want to exclude them you’ll need to set:

```
ASSETS_ENV=test
```

In your ENV (either using `.env`) or when you start the development server. This is only relevant for *development*, production builds do not include these packages.

## TODOs

- [ ] [Tree shaking doesn’t work at the moment](https://github.com/facebookincubator/create-react-app/pull/1742), alas. Once it’s sorted in `create-react-app` we should be able to pull it in automatically.
- [ ] Enable relative import paths for CSS references (postcss-import only supports root-level resolution).

## Credits

The structure, concept, and most of the code from [create-react-app](https://github.com/facebookincubator/create-react-app) forms the basis for this repo. We still leverage a bunch of stuff from that project so that we’re providing stable and ongoing improvements.

