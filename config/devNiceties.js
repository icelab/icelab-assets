"use strict";

// This is a workaround used alongside the webpack-dev-server hot-module-reload
// feature as it's quite chatty on the console, and there's no currently no
// configuration option to silence it. Only used in development. Prevent
// messages starting with [HMR] or [WDS] from being printed to the console
// when using console.log or console.warn
(function(global) {
  var console_log = global.console.log;
  global.console.log = function() {
    if (
      !(arguments.length == 1 &&
        typeof arguments[0] === "string" &&
        arguments[0].match(/^\[(HMR|WDS)\]/))
    ) {
      console_log.apply(global.console, arguments);
    }
  };
  var console_warn = global.console.warn;
  global.console.warn = function() {
    if (
      !(arguments.length == 1 &&
        typeof arguments[0] === "string" &&
        arguments[0].match(/^\[(HMR|WDS)\]/))
    ) {
      console_warn.apply(global.console, arguments);
    }
  };

  // Automatically reload *extracted* CSS in development when hotUpdates are issued
  // https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-231010662
  global.addEventListener(
    "message",
    function(e) {
      if (
        typeof e.data !== "String" ||
        e.data.search("webpackHotUpdate") === -1
      )
        return;
      global.document
        .querySelectorAll("link[href][rel=stylesheet]")
        .forEach(function(link) {
          if (link.href.search("localhost") > -1) {
            var nextStyleHref = link.href.replace(
              /(\?\d+)?$/,
              "?" + Date.now()
            );
            link.href = nextStyleHref;
          }
        });
    },
    false
  );
})(window);
