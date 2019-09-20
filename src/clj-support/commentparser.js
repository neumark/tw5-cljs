/*\
title: $:/plugins/neumark/literate-edn/commentparser.js
type: application/javascript
module-type: library

parse end file into blocks (some comment, some non comment)

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var defaultFinishBlock = function(lines, isCommentBlock) {
    const lineMapper = isCommentBlock ? l => /\s*;\s*(.*)$/.exec(l)[1] : x => x;
    const text = lines.map(lineMapper).join('\n');
    return {isCommentBlock, text};
};

var parseCommentBlocks = function(text, finishBlock) {
    finishBlock = finishBlock || defaultFinishBlock;
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
    return result.pastBlocks;
};

exports.parseCommentBlocks = parseCommentBlocks;
})();

