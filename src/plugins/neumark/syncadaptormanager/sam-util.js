/*\
title: $:/plugins/neumark/syncadaptormanager/sam-util.js
type: application/javascript
module-type: library

Read syncadapter utils

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var utils = {
    isArray: function(arr) {
        return arr && (Object.prototype.toString.call(arr) === "[object Array]");
    },
    isDate: function(d) {
        return (d && (Object.prototype.toString.call(d) === "[object Date]"));
    },
    isObject: function(o) {
        return o && (Object.prototype.toString.call(o) === "[object Object]");
    }
};

Object.assign(exports, utils);
})();
