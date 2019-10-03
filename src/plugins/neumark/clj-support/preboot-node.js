/*\
title: $:/plugins/neumark/clj-support/preboot-node.js
type: application/javascript
\*/
const path = require('path');
const parseCommentBlocks = require("./commentparser.js").parseCommentBlocks;
exports.setup = function($tw) {
    $tw.config.fileExtensionInfo =  $tw.config.fileExtensionInfo || Object.create(null);
    $tw.config.contentTypeInfo = $tw.config.contentTypeInfo || Object.create(null);
    // register clojure file types
    $tw.utils.registerFileType("application/edn","utf8",".edn");
    // based on https://cljs.github.io/api/cljs.repl.browser/ext-GTmime-type
    $tw.utils.registerFileType("text/x-clojure","utf8",[".clj",".cljs",".cljc"],{deserializerType:"application/edn"});

    
    // attempts to load tiddler metadata from EDN file comment if there is no .meta file
    $tw.modules.define("$:/boot/tiddlerdeserializer/edn","tiddlerdeserializer",{
        "application/edn": function(text,fields) {
            const filename = fields.title;
            const metadata = $tw.loadMetadataForFile(fields.title);
            if (metadata) {
                Object.assign(fields, metadata);
            } else {
                // console.log("EDN: no metafile for ", filename);
                blocks = parseCommentBlocks(text);
                if (blocks.length > 0 && blocks[0].isCommentBlock) {
                    $tw.utils.parseFields(blocks[0].text, fields);
                    // only return the file after the header comment
                    const headerLines = blocks[0].text.split('\n');
                    const allLines = text.split('\n');
                    headerLines.forEach(_ => allLines.shift());
                    text = allLines.join('\n');
                }
                // if tiddler is within content dir, remove content dir prefix from title
                var tiddlersPath = path.resolve($tw.config.wikiTiddlersSubDir);
                if (filename.startsWith(tiddlersPath)) {
                    // +1 to remove trailing slash
                    fields.title = filename.substr(tiddlersPath.length+1);
                } else {
                    // if tiddler is in plugin dir, replace plugin dir prefix with "$:/plugins"
                    $tw.getLibraryItemSearchPaths($tw.config.pluginsPath, $tw.config.pluginsEnvVar)
                        .map(p => path.resolve(p))
                        .filter(p => filename.startsWith(p))
                        .forEach(p => {
                            fields.title = "$:/plugins" + filename.substr(p.length);
                        });
                }
            }
            fields.text = text;
            fields.type = fields.type || (filename.endsWith(".edn") ? "application/edn" : "text/x-clojure");
            return [fields];
        }
    });
};
