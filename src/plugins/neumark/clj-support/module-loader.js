/*\
title: $:/plugins/neumark/clj-support/module-loader.js
type: application/javascript
module-type: startup

\*/

exports.name = "cljsModuleLoader";
exports.platforms = ["browser"];
exports.after = ["load-modules"];
exports.synchronous = true;
exports.startup = () => {
    $tw.wiki.each((tiddler,title) => {
        if (tiddler.hasField("module-type") && tiddler.fields.type === "text/x-clojure") {
            console.log("loading cljs module", title);
            goog.global.cljs_standalone.compiler.eval(title, tiddler.fields.text).then(
                // TODO: issue warning on compilation failure
                moduleExports => $tw.modules.define(title, tiddler.fields["module-type"], moduleExports));
        }
    });
};
