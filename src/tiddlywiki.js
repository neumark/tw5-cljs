#!/usr/bin/env node
const path = require("path");

function initTiddlywiki(opts) {
    // Initialize boot code
    ({twConfig, preboot, preloadTiddlers, argv} = opts || {});
    var TW_HOME = path.resolve(__dirname, "../node_modules/tiddlywiki/");
    var $tw = require(path.resolve(TW_HOME, "boot/bootprefix.js")).bootprefix();
    require(path.resolve(TW_HOME, "boot/boot.js")).TiddlyWiki($tw);
    $tw.cljs_standalone = require(path.resolve(__dirname, "../files/cljs-standalone.js")).cljs_standalone;

    // Pass the command line arguments to the boot kernel
    $tw.boot.argv = argv || Array.prototype.slice.call(process.argv,2);

    if (preloadTiddlers) {
        $tw.preloadTiddlerArray(preloadTiddlers);
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
