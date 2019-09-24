/*\
title: $:/plugins/neumark/syncadaptormanager/sam-invoker.js
type: application/javascript
module-type: library

A factory for sync adaptor modules which proxying another sync adaptor

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
const samPromise = require('./sam-promise.js');
const callbackInterfaceMethods = ['isReady', 'getTiddlerInfo', 'saveTiddler', 'loadTiddler', 'deleteTiddler', 'getStatus', 'getSkinnyTiddlers', 'login', 'logout'];

class CallbackProxyInvoker {
    constructor(backingAdaptorConstructor, config) {
        this.backingAdaptorConstructor = backingAdaptorConstructor;
        this.config = config || {};
        this.name = backingAdaptorConstructor.prototype.name || 'callback-adaptor-invoker';
    }
    getMethods() {
        return callbackInterfaceMethods.filter((m) => !!this.backingAdaptorConstructor.prototype[m]);
    }
    init(options) {
        this.instance = new this.backingAdaptorConstructor(Object.assign({}, options, {sam: this.config}));
    }
    // default implementation simply calls method
    invoke(methodName, args) {
        console.log("proxy sync adaptor calling " + methodName);
        return this.instance[methodName].apply(this.instance, args);
    }
};

// An invoker which takes an instance of IPromiseSyncAdaptor to provide the
// standard TiddlyWiki SyncAdaptor interface.
class PromiseToCallbackInvoker {
    constructor(promiseAdaptorConstructor, config) {
        this.promiseAdaptorConstructor = promiseAdaptorConstructor;
        this.config = config || {};
        this.name = promiseAdaptorConstructor.name || 'promise-to-callback-invoker';
    }
    // --- invoker methods ---
    getMethods() {
        return samPromise.getSupportedCallbackInterfaceMethods(this.promiseAdaptorConstructor);
    }
    init(options) {
        this.instance = new this.promiseAdaptorConstructor(Object.assign({}, options, {sam: this.config}));
        // automatically read all tiddlers on startup if the function exists.
        if (typeof this.instance.readAll === 'function') {
            this.instance.readAll().then(
                () => {console.log("read all tiddlers");},
                (e) => {throw e;});
        }
    }
    invoke(methodName, args) {
        return this[methodName].apply(this, args);
    }
    // --- classic syncadaptor interface methods ---
    isReady() {
        return this.instance.isReady();
    }
    getTiddlerInfo(tiddler) {
        return this.instance.getTiddlerInfo(tiddler);
    }
    saveTiddler(tiddler, callback) {
        // callback parameters: (err,adaptorInfo,revision)
        return this.instance.write(tiddler.fields).then(
            (result) => callback(null, result.adaptorInfo, result.revision),
            callback);
    }
    loadTiddler(tiddlerTitle, callback) {
        // callback parameters: (err,tiddlerFields)
        return this.instance.read(tiddlerTitle).then(
            (tidderFields) => callback(null, tiddlerFields),
            callback);
    }
    deleteTiddler(tiddlerTitle, callback, options) {
        return this.instance.remove(tiddlerTitle, options).then(
            () => callback(null),
            callback);
    }
    getStatus(callback) {
        return this.instance.getStatus().then(
            (status) => callback(status.isLoggedIn, status.username, status.isReadOnly, status.isAnonymous),
            callback);
    }
    login(username, password, callback) {
        return this.instance.login(username, password).then(
            () => callback(null),
            callback);
    }
    logout(callback) {
        return this.instance.logout().then(
            () => callback(null),
            callback);
    }
    getSkinnyTiddlers(callback) {
        return this.instance.readSkinny().then(
            (skinnyTiddlers) => callback(null, skinnyTiddlers),
            callback);
    }
};


// wraps an object implementing the standard TiddlyWiki callback-based
// syncadaptor interface and provise a PromiseInterface to it.

class CallbackToPromiseInvoker extends samPromise.IPromiseSyncAdaptor {
    constructor(callbackAdaptorConstructor, config) {
        super();
        this.callbackAdaptorConstructor = callbackAdaptorConstructor;
        this.config = config || {};
        this.name = callbackAdaptorConstructor.name || 'callback-to-promise-invoker';
    }
    // --- invoker methods ---
    getMethods() {
        return samPromise.getSupportedPromiseInterfaceMethods(this.callbackAdaptorConstructor);
    }
    init(options) {
        this.instance = new this.callbackAdaptorConstructor(Object.assign({}, options, {sam: this.config}));
    }
    invoke(methodName, args) {
        return this[methodName].apply(this, args);
    }
    // --- promise syncadaptor interface methods ---
    isReady() {
        return this.instance.isReady();
    }
    getTiddlerInfo(tiddler) {
        return this.instance.getTiddlerInfo(tiddler);
    }
    write(tiddlerFields) {
        return new Promise((resolve, reject) => {
            this.instance.saveTiddler(new $tw.Tiddler(tiddlerFields), (err,adaptorInfo,revision) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({adaptorInfo, revision});
                }
            });
        });
    }
    read(tiddlerTitle) {
        return new Promise((resolve, reject) => {
            this.instance.loadTiddler(tiddlerTitle, (err,tiddlerFields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tiddlerFields);
                }
            });
        });
    }
    // loadAll has no equivalent in the callback interface
    readAll() {return Promise.resolve([]);}
    remove(tiddlerTitle, options) {
        return new Promise((resolve, reject) => {
            this.instance.deleteTiddler(tiddlerTitle, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(null);
                }
            }, options);
        });
    }
    getStatus() {
        return new Promise((resolve, reject) => {
            this.instance.getStatus((err, isLoggedIn, username, isReadOnly, isAnonymous) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({isLoggedIn, username, isReadOnly, isAnonymous});
                }
            });
        });
    }
    login(username, password) {
        return new Promise((resolve, reject) => {
            this.instance.login(username, password, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(null);
                }
            });
        });
    }
    logout() {
        return new Promise((resolve, reject) => {
            this.instance.logout((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(null);
                }
            });
        });
    }
    readSkinny() {
        return new Promise((resolve, reject) => {
            this.instance.getSkinnyTiddlers((err, skinnyTiddlers) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(skinnyTiddlers);
                }
            });
        });
    }
}

function wrapInvoker(invoker) {

    function WrappedSyncAdaptor(options) {
        invoker.init(options);
    }
    WrappedSyncAdaptor.prototype.name = invoker.name || "sam-wrapped-adaptor";
    WrappedSyncAdaptor.prototype.isPromiseSyncAdaptor = invoker.isPromiseSyncAdaptor;

    invoker.getMethods().forEach((m) => {
        WrappedSyncAdaptor.prototype[m] = function() {return invoker.invoke(m, arguments);};
    });
    return WrappedSyncAdaptor;
};

const METHOD_BLACKLIST = ['constructor'];

function getMethods(cls) {
    var methods = [];
    for (var i in cls.prototype) {
        if ((typeof cls.prototype[i] === 'function') && METHOD_BLACKLIST.indexOf(i) < 0) {
            methods.push(i);
        }
    }
    return methods;
}

Object.assign(exports, {
    wrapInvoker,
    getMethods,
    CallbackProxyInvoker,
    PromiseToCallbackInvoker,
    CallbackToPromiseInvoker
});
})();
