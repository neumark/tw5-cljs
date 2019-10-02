/*\
title: $:/plugins/neumark/redefine-modules/main.js
type: application/javascript
module-type: startup

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
exports.name = "redefineModules";
exports.after = ["load-modules"];
exports.synchronous = true;
exports.startup = () => {
    const CODE_RELOADERS = {
        "application/javascript": tiddler => {
            console.log("reloading tiddler", tiddler);
            $tw.modules.define(tiddler.fields.title, tiddler.fields['module-type'], tiddler.fields.text);
        },
        "text/x-clojure": null // TODO
    };
    const maybeReloadTiddler = tiddler => {
        console.log("maybeReloadTiddler", tiddler);
        const tiddlerType = tiddler && tiddler.fields && tiddler.fields.type && tiddler.fields.type;
        const reloader = CODE_RELOADERS[tiddlerType];
        const isModule = tiddler && tiddler.fields && tiddler.fields && tiddler.fields['module-type'];
        if (isModule && reloader) {
            reloader(tiddler);
        }
    };
    const truthy = x => x;
    const notDraft = t => t && t.fields && t.fields["draft.of"] === undefined;
    const maybeRedefine = (modifiedTiddlers) => {
        modifiedTiddlers
            .map(t => $tw.wiki.getTiddler(t))
            .filter(notDraft)
            .forEach(maybeReloadTiddler);
    };
    $tw.wiki.addEventListener("change", (changes) => {
        const modifiedTiddlers = Object.entries(changes)
            .map(([title, changeType]) => (changeType.modified === true && changeType.deleted !== true) ? title : null)
            .filter(truthy);
        maybeRedefine(modifiedTiddlers);
    });
};

}());
