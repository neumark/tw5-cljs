/*\
title: $:/plugins/neumark/literate-code/wrapper.js
type: application/javascript
module-type: parser

EDN comment blocks become WikiText.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


var finishBlock = function(lines, isCommentBlock) {
    // creates markdown representation of block
    if (isCommentBlock) {
        // remove leading semicolon
        return lines.map(l => /\s*;\s*(.*)$/.exec(l)[1]).join('\n');
    }
    return "\n```\n" + lines.join('\n') + "\n```\n";
};

var preprocess = function(text) {
    const lines = text.trim().split('\n');
    const finishCurrentBlock = (acc) => {
            if (acc.currentBlockLines.length > 0) {
                acc.pastBlocks.push(finishBlock(acc.currentBlockLines, acc.inComment));
            }
    };
    const result = lines.reduce((acc, currentLine) => {
        const isCommentLine = currentLine.trim().startsWith(";");
        if (acc.inComment === isCommentLine) {
            // grow current block
            acc.currentBlockLines.push(currentLine);
        } else {
            // start new block
            finishCurrentBlock(acc);
            acc.inComment = isCommentLine;
            acc.currentBlockLines = [currentLine];
        }
        return acc;
    }, {inComment: false, pastBlocks: [], currentBlockLines: []});
    // finish last incomplete black
    finishCurrentBlock(result);
    const processedText = result.pastBlocks.join('\n');
    console.log(processedText);
    return processedText;
};

const WikiParser = require('$:/core/modules/parsers/wikiparser/wikiparser.js')["text/vnd.tiddlywiki"];
// based on https://www.bennadel.com/blog/1566-using-super-constructors-is-critical-in-prototypal-inheritance-in-javascript.htm
//      and https://stackoverflow.com/a/4389429

function extend(base, sub) {
  // Avoid instantiating the base class just to setup inheritance
  // Also, do a recursive merge of two prototypes, so we don't overwrite 
  // the existing prototype, but still maintain the inheritance chain
  // Thanks to @ccnokes
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  // The constructor property was set wrong, let's fix it
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
}

var LiterateEDNParser = function(type,text,options) {
    const preprocessedText = preprocess(text);
    console.log(preprocessedText);
    WikiParser.apply(this, [type, preprocessedText, options]);
};

extend(WikiParser, LiterateEDNParser);

exports["application/edn"] = LiterateEDNParser;
})();

