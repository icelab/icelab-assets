# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

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