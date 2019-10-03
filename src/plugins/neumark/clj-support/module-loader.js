/*\
title: $:/plugins/neumark/clj-support/module-loader.js
type: application/javascript
module-type: library
\*/

exports.loadCLJSModuleTiddler = async tiddler => {
    const title = tiddler.fields.title;
    return goog.global.cljs_standalone.compiler.eval(title, tiddler.fields.text).then(
        moduleExports => $tw.modules.define(title, tiddler.fields["module-type"], moduleExports)
        // TODO: issue warning on compilation failure
    );
};
