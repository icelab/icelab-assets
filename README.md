# Icelab Assets

## Installation

Add `icelab-assets` as a `devDependency` to your app with one of the below tasks:

```
# Using npm
npm install --save-dev icelab/icelab-assets
# Using yarn
yarn add --dev icelab/icelab-assets
```

Then add this config to the `scripts` section of your `package.json` file:

```
"scripts": {
  "start": "icelab-assets start",
  "build": "icelab-assets build",
  "test": "icelab-assets test"
}
```

## Usage

Once you’re set up, you’ll have three tasks available that you can run with either `npm run` or `yarn run`:

* `start` will boot a development server at <http://localhost:8080> which will watch your asset files and rebuild on the fly.
* `build` will create a production-ready build for each of your asset entry points.
* `test` will use [jest](https://facebook.github.io/jest/) to run the tests for your assets.

By default, `icelab-assets` looks for asset entry points at `apps/**/**/entry.js` and will generate a name for that entry based on its parent directories. Given the following entry points (and assuming they only returned JavaScript):

```
apps/admin/assets/admin/entry.js
apps/admin/assets/inline/entry.js
apps/main/assets/public/entry.js
apps/main/assets/critical/entry.js
```

These output names would be generated:

```
admin__admin.js
admin__inline.js
main__public.js
main__critical.js
```

## Configuration

### Paths

You can override default path options using the following command line args:

* `--app-source-path` — defaults to `apps`
* `--build-path` — defaults to `public/assets`
* `--public-path` — defaults to `/assets/`

If you were using this in conjunction with WordPress for example, you might do something like:

```json
"scripts": {
  "start": "icelab-assets start --app-source-path=wp-content/themes",
  "build": "icelab-assets build --app-source-path=wp-content/themes",
  "test": "icelab-assets test --app-source-path=wp-content/themes"
}
```

This would traverse within `wp-content/themes` for any `entry.js` files and use them as the entry points for the build.

### App-specific webpack configurations

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
          loader: 'foobar'
        }]
      },
      {
        test: /\.css$/,
        use: [{
          loader: 'foobar'
        }]
      },
    ],
  }
}
```

This would append the theoretical `foobar` loader to the end of the pipeline in both cases.

## Features

### CSS

### JavaScript

* ES6

## Things to note

* CSS import paths

## Credits

The structure, concept, and most of the code from [create-react-app](https://github.com/facebookincubator/create-react-app) forms the basis for this repo.

