#!/usr/bin/env node

// Initialize boot code
var TW_HOME = "../node_modules/tiddlywiki/";
var $tw = require(TW_HOME + "boot/bootprefix.js").bootprefix();
require(TW_HOME + "boot/boot.js").TiddlyWiki($tw);

// Load custom config
$tw.config = Object.assign($tw.config || {}, require('./twconfig.json'));

// Install Clojure support 
require('./clj-support/main').setup($tw);

// Pass the command line arguments to the boot kernel
$tw.boot.argv = Array.prototype.slice.call(process.argv,2);

// Boot the TW5 app
$tw.boot.boot();
