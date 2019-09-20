/*\
title: $:/plugins/neumark/node-shell-exec/action-shell-exec.js
type: application/javascript
module-type: widget


Action to send shell command to node

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var ShellExecWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ShellExecWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ShellExecWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
ShellExecWidget.prototype.execute = function() {
    this.actionCommand = this.getAttribute("$command");
    // by default create new tiddler
    this.doCreateTiddler = this.getAttribute("$createTiddler") !== 'false';
    // by default don't show dialog
    this.doShowDialog = this.getAttribute("$showDialog") === 'true';
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
ShellExecWidget.prototype.refresh = function(changedTiddlers) {
    var changedAttributes = this.computeAttributes();
    if(Object.keys(changedAttributes).length) {
        this.refreshSelf();
        return true;
    }
    return this.refreshChildren(changedTiddlers);
};

ShellExecWidget.prototype.httpRequest = function(command) {
    return fetch("/exec/", {
        method: "POST",
        body: JSON.stringify({command}),
        headers: {'X-Requested-With': 'TiddlyWiki'} }).then(function(res){ return res.json(); })
};

ShellExecWidget.prototype.newTiddler = function() {
    // $message="tm-new-tiddler" title=<<journalTitle>> tags=<<journalTags>> text=<<journalText>>/

};

var formatResult = function(result) {
    var out = "! STDOUT\n```\n" + result.stdout + "\n```\n";
    if (result.stderr.trim().length > 0) {
        out += "\n! STDERR:\n\n```\n"+ result.stderr + "\n```\n";
    }
    return out;
};

ShellExecWidget.prototype.showDialog = function(result) {
    var errHeading = "Shell command", promptMsg = result.command, errText= result.stdout, dm = $tw.utils.domMaker,
            heading = dm("h1",{text: errHeading}),
            prompt = dm("div",{text: promptMsg, "class": "tc-error-prompt"}),
            message = dm("div",{text: errText, "class":"tc-error-message"}),
            button = dm("div",{children: [dm("button",{text: ( $tw.language == undefined ? "close" : $tw.language.getString("Buttons/Close/Caption") )})], "class": "tc-error-prompt"}),
            form = dm("form",{children: [heading,prompt,message,button], "class": "tc-dialog-form"});
        document.body.insertBefore(form,document.body.firstChild);
        form.addEventListener("submit",function(event) {
            document.body.removeChild(form);
            event.preventDefault();
            return false;
        },true);
};

ShellExecWidget.prototype.createTiddler = function(result) {
        this.dispatchEvent({
            type: "tm-new-tiddler",
            param: "$:/plugins/neumark/node-shell-exec/template",
            paramObject: {
                title: new Date().toISOString() + " exec '"+ this.actionCommand + "'",
                text:  formatResult(result),
            },
            tiddlerTitle: this.getVariable("currentTiddler"),
            navigateFromTitle: this.getVariable("currentTiddler"),
            event: event
        });
};



/*
Invoke the action associated with this widget
*/
ShellExecWidget.prototype.invokeAction = function(triggeringWidget,event) {
    this.httpRequest(this.actionCommand).then((result) => {
        if (this.doShowDialog) {
            this.showDialog(result);
        }
        if (this.doCreateTiddler) {
            this.createTiddler(result);
        }
    });
 	return true; // Action was invoked
};

exports["action-shell-exec"] = ShellExecWidget;

})();
