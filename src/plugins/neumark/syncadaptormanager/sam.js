/*\
title: $:/plugins/neumark/syncadaptormanager/sam.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with the local filesystem via node.js APIs

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var configReader = require("./sam-config.js");

const configTiddlerTitle = "$:/config/SyncAdaptorManagerConfig";   
    
// exports.syncadaptorModules will be populated by sam-loader.js
exports.syncadaptorModules = {};

var samAdaptorClass = null;

var getConfig = () => {
  var config = {};
  if ($tw.wiki.tiddlerExists(configTiddlerTitle)) {
    Object.assign(config, JSON.parse($tw.wiki.getTiddlerText(configTiddlerTitle)));
  }
  return config;
};

var makeAdaptorClass = () => {
  var adaptorConfig = getConfig().adaptor;
  var sa = null;
  if (!adaptorConfig) {
    sa = Object.values(exports.syncadaptorModules)[0].adaptorClass;
    console.log(`no syncadaptormanager config in ${configTiddlerTitle}, falling back to using default syncadaptor module`, sa);
  } else {
    sa = configReader.getAdaptor(adaptorConfig, exports.syncadaptorModules);
    console.log("config-based backing syncadaptor", sa);
  }
  return sa;
};

Object.defineProperty(exports, 'adaptorClass', {
    get() {
      if (samAdaptorClass === null) {
          samAdaptorClass = makeAdaptorClass();
      }
      return samAdaptorClass;
    },
    set(value) { /* noop */ }
  });
})();
