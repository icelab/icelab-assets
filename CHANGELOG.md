# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

# v2.0.6 2019-06-24

* Fix missing plugin reference to ResolveEntryModulesPlugin

# v2.0.5 2019-06-24

* Fix deprecation warning in Prettier output

# v2.0.4 2019-06-24

* Bump eslint past affected versions for [CVE](https://snyk.io/vuln/npm:eslint:20180222)

# v2.0.3 2018-06-22

* Fix top-level absolute requires

# v2.0.2 2018-06-05

* Allow `build` to be run without hashing filenames

# v2.0.1 2018-03-20

* Supress warnings in postcss-custom-properties (through postcss-cssnext)

# v2.0.0 2018-03-20

* Breaking change: Add [`postcss-url`](https://github.com/postcss/postcss-url) to the postcss pipeline. Any `url()` references will need to be updated to be relative paths to the file the reference is included in.

# v1.0.6 2018-03-14

* Ensure production CSS is minified.

# v1.0.5 2018-01-10

* Add `.ico` to default list of files included in bundle when *not* explicitly included by other files.

# v1.0.4 2017-12-13

* Bump webpack deps to avoid issue with child cache.

# v1.0.3 2017-10-19

* Set ASSETS_ENV=test to exclude dev-related entry injections. This is useful in fake-browser environments like phantomjs et al.

# v1.0.2 2017-10-18

* Update prettier parser value to avoid deprecation warning

# v1.0.1 2017-09-28

* Update dependencies across the board. Note: this release disables Hot Module Replacement as it’s not supported by the ExtractTextPlugin (and never really was).

# v1.0.0 2017-09-27

* Initial release
