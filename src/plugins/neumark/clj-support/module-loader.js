/*\
title: $:/plugins/neumark/clj-support/module-loader.js
type: application/javascript
module-type: startup

\*/
exports.name = "cljsModuleLoader";
// exports.platforms = ["browser"];
exports.after = ["load-modules"];
exports.synchronous = true;
exports.cljsModuleLoadPromises = [];
exports.startup = () => {
    $tw.wiki.each((tiddler,title) => {
        if (tiddler.hasField("module-type") && tiddler.fields.type === "text/x-clojure") {
            console.log("loading cljs module", title);
            exports.cljsModuleLoadPromises.push(
                $tw.cljs_standalone.compiler.eval(
                    title,
                    tiddler.fields.text
                    /*,
                    {
                        // logger: customLogger,
                        // source_loader: sourceLoader || dummySourceLoader,
                        context: { goog: globalThis.goog }
                    }*/
                ).then(
                    moduleExports => $tw.modules.define(title, tiddler.fields["module-type"], moduleExports),
                    error => console.log(error)));
        }
    });
};
