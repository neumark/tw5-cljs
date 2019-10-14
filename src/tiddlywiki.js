#!/usr/bin/env node
const path = require("path");
const cljs_standalone = require("../files/cljs-standalone.js");
global.goog = global.goog || {};
global.goog.cljs_standalone = cljs_standalone;

function initTiddlywiki(opts) {
    // Initialize boot code
    ({wikiPath, twConfig, preboot, argv} = opts || {});
    var TW_HOME = path.resolve(__dirname, "../node_modules/tiddlywiki/");
    var $tw = require(path.resolve(TW_HOME, "boot/bootprefix.js")).bootprefix();
    require(path.resolve(TW_HOME, "boot/boot.js")).TiddlyWiki($tw);

    // Pass the command line arguments to the boot kernel
    $tw.boot.argv = argv || Array.prototype.slice.call(process.argv,2);

    // Set wikiPath
    if (wikiPath) {
        $tw.boot.wikiPath = wikiPath;
    }

    // Load custom config
    if (twConfig) {
        $tw.config = Object.assign($tw.config || {}, twConfig);
    }

    // Install Clojure support
    var ready = Promise.resolve(preboot ? preboot($tw) : true);

    // Boot the TW5 app
    return ready.then(() => new Promise((resolve, reject) => $tw.boot.boot(resolve))).then(() => $tw);
};

if (require.main === module) {
    initTiddlywiki({
        twConfig: require(path.resolve(__dirname, 'twconfig.json')),
        preboot: $tw => require(path.resolve(__dirname, 'plugins/neumark/clj-support/preboot-node')).setup($tw)
    });
}

exports.initTiddlywiki = initTiddlywiki
