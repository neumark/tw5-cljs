/*\
title: $:/plugins/neumark/syncadaptormanager/sam-promise-to-cb.js
type: application/javascript
module-type: library

promise to CB adaptor

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
const invoker = require('./sam-invoker.js');
exports.adaptorFactory = (promiseAdaptorConstructor, config) => invoker.wrapInvoker(new invoker.PromiseToCallbackInvoker(promiseAdaptorConstructor, config));
})();
