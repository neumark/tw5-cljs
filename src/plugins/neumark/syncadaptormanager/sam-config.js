/*\
title: $:/plugins/neumark/syncadaptormanager/sam-config.js
type: application/javascript
module-type: library

Read syncadapter config

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// samAPI is not required in this code, but needs to be loaded before SAM adaptors which use it.
const samAPI = require("./sam-api.js");
const samUtil = require("./sam-util.js");
const samInvoker = require('./sam-invoker.js');

const predicates = {
    "platform": $tw.node ? "node" : "browser"
};

function evalCondition(predicate, value) {
    return predicates[predicate] === value;
};

function processCases(cases, syncadaptorModules) {
    for (var i = 0; i < cases.length; i++) {
        if (evalCondition(cases[i].condition.predicate, cases[i].condition.value)) {
            return getAdaptorClass(cases[i].adaptor, syncadaptorModules);
        }
    }
};

function getModule(location, syncadaptorModules) {
    return syncadaptorModules[location] || require(location);
};

function getClass(location, syncadaptorModules) {
    return getModule(location, syncadaptorModules).adaptorClass;
};

function makeFactory(config, syncadaptorModules) {
    var factory = getModule(config.location, syncadaptorModules).adaptorFactory;
    var adaptorClass = getAdaptorClass(config.adaptor, syncadaptorModules);
    return factory(adaptorClass, config);
}

function getAdaptorClass (config, syncadaptorModules) {
    if (samUtil.isArray(config)) {
        return config.map((c) => getAdaptorClass(c, syncadaptorModules));
    }
    const adaptorType = config.type || "class";
    switch (adaptorType) {
        case "class":
            return getClass(config.location, syncadaptorModules);
        case "conditional":
            return processCases(config.cases, syncadaptorModules);
        case "factory":
            return makeFactory(config, syncadaptorModules);
        default:
            throw new Error ("SAM doesnt know about adaptor type "+adaptorType);
    };
};

// getAdaptor needs the syncadaptorModules map because loading sam bungles these
// modules so startup.js doesn't load a different syncadaptor than SAM.
// The original version of these modules lives in syncadaptorModules instead.
function getAdaptor (config, syncadaptorModules) {
    var adaptorClass = getAdaptorClass(config, syncadaptorModules);
    if (samUtil.isArray(adaptorClass)) {
        throw new Error ("Top-level syncadaptor cannot be an array, must be single class");
    }
    if (!adaptorClass) {
        throw new Error ("SAM didn't find a sync adaptor, check your wiki config");
    }
    //PromiseInterface classes need to be wrapped to have callback-style interface
    if (samAPI.isPromiseSyncAdaptor(adaptorClass)) {
        return samInvoker.wrapInvoker(new samInvoker.PromiseToCallbackInvoker(adaptorClass, config))
    }
    return adaptorClass;
};

Object.assign(exports, {
    getAdaptor
});
})();
