/*\
title: $:/plugins/neumark/syncadaptormanager/sam-promise.js
type: application/javascript
module-type: library

Promise Interface-related stuff

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

function unimplemented() {
    return Promise.reject(new Error("unimplemented"));
};

class IPromiseSyncAdaptor {
    /*  --- mandatory methods ---  */
    isReady() {return true;}
    getTiddlerInfo() {return {};}
    write(tiddlerFields) { return unimplemented(); /*Promise({adopterInfo, revision} | err)*/ }
    read(tidderTitle) { return unimplemented(); /*Promise(tiddlerFields | err)*/ }
    readAll() { return unimplemented(); /*Promise([tiddlerFields] | err)*/ }
    remove(title, options) { return unimplemented(); /*Promise(true | err)*/ }
    /*  --- optional methods (capabilities) --- */
    // EG: to disable getStatus, we would need MyAwesomeAdaptor.getStatus = null; after the class definition
    getStatus() { return unimplemented(); /*Promise({isLoggedIn, username, isReadOnly, isAnonymous} | err)*/ }
    login(username, password) { return unimplemented(); /*Promise(null | err)*/ }
    logout() { return unimplemented(); /*Promise(null | err)*/ }
    readSkinny() {return unimplemented(); /*Promise([skinnyTiddlerFields] | err)*/ }
}
IPromiseSyncAdaptor.prototype.isPromiseSyncAdaptor = true;

const METHOD_MAP = {
    // callback interface method : promise interface method
    'isReady': 'isReady',
    'getTiddlerInfo': 'getTiddlerInfo',
    'saveTiddler': 'write',
    'loadTiddler': 'read',
    'loadAllTiddlers': 'readAll', // not a standard callback interface method
    'deleteTiddler': 'remove',
    'getStatus': 'getStatus',
    'getSkinnyTiddlers': 'readSkinny',
    'login': 'login',
    'logout': 'logout'
};

function hasMethod(cls, methodName) {
    return typeof cls.prototype[methodName] === 'function';
}

function getSupportedCallbackInterfaceMethods(promiseSyncAdaptorClass) {
    return Object.entries(METHOD_MAP).filter(
        entry => hasMethod(promiseSyncAdaptorClass, entry[1])).map(
        entry => entry[0]);
};

function getSupportedPromiseInterfaceMethods(callbackSyncAdaptorClass) {
    return Object.entries(METHOD_MAP).filter(
        entry => hasMethod(callbackSyncAdaptorClass, entry[0])).map(
        entry => entry[1]);
};

function isPromiseSyncAdaptor(cls) {
    return !!cls.prototype.isPromiseSyncAdaptor;
}

Object.assign(exports, {isPromiseSyncAdaptor, IPromiseSyncAdaptor, getSupportedCallbackInterfaceMethods, getSupportedPromiseInterfaceMethods});
})();
