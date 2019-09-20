/*\
title: $:/plugins/neumark/node-shell-exec/post-exec.js
type: application/javascript
module-type: route

POST /exec/

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


var runCommand = function(command) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve({command, error, stdout, stderr});
        });
    });
}

exports.method = "POST";
exports.path = /^\/exec\/$/;
exports.handler = function(request,response,state) {
    const data = JSON.parse(state.data);
    console.log("post-exec received command " + data.command);
	response.writeHead(200, "OK", {
		"Cache-Control": "no-cache",
        "Cache-Control": "no-store",
		"Content-Type": "application/json"
	});
    runCommand(data.command).then((result) => {
        //console.log(result);
        response.end(JSON.stringify(result),"utf8");
    });
};

}());
