/*\
title: $:/plugins/neumark/syncadaptormanager/sam-api.js
type: application/javascript
module-type: library

API for use by SAM sync adaptor modules

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
const samUtil = require("$:/plugins/neumark/syncadaptormanager/sam-util.js");
const samPromise = require("$:/plugins/neumark/syncadaptormanager/sam-promise.js");
Object.assign(exports, {
    IPromiseSyncAdaptor: samPromise.IPromiseSyncAdaptor,
    isPromiseSyncAdaptor: samPromise.isPromiseSyncAdaptor,
    util: samUtil
});

})();
