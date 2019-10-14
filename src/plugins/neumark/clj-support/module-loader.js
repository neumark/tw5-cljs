/*\
title: $:/plugins/neumark/clj-support/module-loader.js
type: application/javascript
module-type: startup

\*/
exports.name = "cljsModuleLoader";
// exports.platforms = ["browser"];
exports.after = ["load-modules"];
exports.synchronous = true;
exports.startup = () => {
    var global = Function('return this')();
    global.goog = global.goog || {};
    global.goog.cljs_standalone = $tw.cljs_standalone;
    $tw.wiki.each((tiddler,title) => {
        if (tiddler.hasField("module-type") && tiddler.fields.type === "text/x-clojure") {
            console.log("loading cljs module", title);
            $tw.cljs_standalone.compiler.eval(title, tiddler.fields.text).then(
                moduleExports => $tw.modules.define(title, tiddler.fields["module-type"], moduleExports),
                error => console.log(error));
        }
    });
};
