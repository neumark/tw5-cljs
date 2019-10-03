/*\
title: $:/plugins/neumark/clj-support/preboot-browser.js
type: application/javascript
\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// duplicated from: $:/plugins/neumark/clj-support/module-loader.js
const loadCLJSModule = async tiddler => {
    const title = tiddler.fields.title;
    return goog.global.cljs_standalone.compiler.eval(title, tiddler.fields.text).then(
        moduleExports => $tw.modules.define(title, tiddler.fields["module-type"], moduleExports)
        // TODO: issue warning on compilation failure
    );
};

// eventually, this should also be done for node, but we're doing browser first
// the following is copeid from TW5/boot/boot.js and extended with the text/x-clojure case:
const defineTiddlerModule = async (tiddler) => {
    switch (tiddler.fields.type) {
        case "text/x-clojure":
            return loadCLJSModule(tiddler);
        case "application/javascript":
            // We only define modules that haven't already been defined, because in the browser modules in system tiddlers are defined in inline script
            if(!$tw.utils.hop($tw.modules.titles,tiddler.fields.title)) {
                $tw.modules.define(tiddler.fields.title,tiddler.fields["module-type"],tiddler.fields.text);
            }
            break;
        case "application/json":
            $tw.modules.define(tiddler.fields.title,tiddler.fields["module-type"],JSON.parse(tiddler.fields.text));
            break;
        case "application/x-tiddler-dictionary":
            $tw.modules.define(tiddler.fields.title,tiddler.fields["module-type"],$tw.utils.parseFields(tiddler.fields.text));
            break;
    };
};

// monkeypatch $tw.modules.execute to run cljs code through cljs-standalone
const originalEvalSandboxed = $tw.utils.evalSandboxed;
$tw.utils.evalSandboxed = function (code,context,filename) {
    // TODO: cljc, clj
    if (filename.endsWith(".cljs")) {
        const moduleExports = goog.global.cljs_standalone.compiler.eval(filename, code, {context});
        console.log("CLJS evalSandboxed", moduleExports);
        return moduleExports;
    } else {
        return originalEvalSandboxed.apply(this, arguments);
    }
};

// monkeypatch to allow cljs tiddler modules to load
$tw.Wiki.prototype.defineTiddlerModules = async function() {
    this.each(async function(tiddler,title) {
        if(tiddler.hasField("module-type")) {
            await defineTiddlerModule(tiddler);
        }
    });
};

console.log("clj-support:preboot-browser.js");

})();
