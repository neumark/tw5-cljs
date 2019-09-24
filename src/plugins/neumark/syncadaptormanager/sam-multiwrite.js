/*\
title: $:/plugins/neumark/syncadaptormanager/sam-multiwrite.js
type: application/javascript
module-type: library

writes tiddlers to multiple syncadapters

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
const samInvoker = require('./sam-invoker.js');
const samPromise = require('./sam-promise.js');
const WRITE_METHODS = ["write", "remove"];
// An invoker which writes to multiple adaptors
class MultiWriteAdaptorInvoker {
    constructor(adaptorConstructors, config) {
        console.log("multiwrite got", adaptorConstructors, config);
        // TODO: throw exception in no adatpros received
        // this.constructors contains only constructors which produce promise-interface adaptors
        this.config = config;
        this.name = (adaptorConstructors[0] || {}).name || 'promise-to-callback-invoker';
        this.constructors = adaptorConstructors.map(c => samPromise.isPromiseSyncAdaptor(c) ? c : samInvoker.wrapInvoker(new samInvoker.CallbackToPromiseInvoker(c, this.config)));
        this.readConstructor = this.constructors[0];
        this.instances = null;
        this.readInstance = null;
    }
    // --- invoker methods ---
    getMethods() {
        return samInvoker.getMethods(this.readConstructor);
    }
    init(options) {
        this.instances = this.constructors.map(c => new c(Object.assign({}, options, {sam: this.config})));
        this.readInstance = this.instances[0];
    }
    invoke(methodName, args) {
        if (WRITE_METHODS.indexOf(methodName) >= 0) {
            // Promise.all resolves an array of results, but rejects a single error (presumably the first)
            return Promise.all(this.instances.map(i => i[methodName].apply(i, args))).then((allResults) => allResults[0]);
        }
        return this.readInstance[methodName].apply(this.readInstance, args);
    }
};
MultiWriteAdaptorInvoker.prototype.isPromiseSyncAdaptor = true;

exports.adaptorFactory = (adaptorClasses, config) => samInvoker.wrapInvoker(new MultiWriteAdaptorInvoker(adaptorClasses, config));
})();
