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

const configTiddlerTitle = "$:/state/config/syncadaptormanager";   
    
// exports.syncadaptorModules will be populated by sam-loader.js
exports.syncadaptorModules = {};

var samAdaptorClass = null;

var getConfig = () => {
  var config = {};
  if ($tw.wiki.tiddlerExists(configTiddlerTitle)) {
    Object.assign(config, JSON.parse($tw.wiki.getTiddlerText(configTiddlerTitle)));
  }
  if ($tw && $tw.boot && $tw.boot.wikiInfo && $tw.boot.wikiInfo.syncadaptormanager) {
    Object.assign(config, $tw.boot.wikiInfo.syncadaptormanager);
  }
  // save config to tiddler which is not synced according to TW5/core/wiki/config/SyncFilter.tid
  // so its sent to the browser but not persisted to syncadapters.
  $tw.wiki.addTiddler({title: configTiddlerTitle, text: JSON.stringify(config)});
  return config;
};

var makeAdaptorClass = () => {
  var adaptorConfig = getConfig().adaptor;
  var sa = null;
  if (!adaptorConfig) {
    sa = Object.values(exports.syncadaptorModules)[0].adaptorClass;
    console.log("no syncadaptormanager config in wikiInfo, falling back to usinga syncadaptor module", sa);
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
