/*\
title: $:/plugins/neumark/syncadaptormanager/sam-loader-macro.js
type: application/javascript
module-type: widget

Action widget to initialize SAM

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var SAMLoaderWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
SAMLoaderWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
SAMLoaderWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
SAMLoaderWidget.prototype.execute = function() {
	this.actionTiddler = this.getAttribute("$tiddler",this.getVariable("currentTiddler"));
	this.actionField = this.getAttribute("$field");
	this.actionIndex = this.getAttribute("$index");
	this.actionValue = this.getAttribute("$value");
	this.actionTimestamp = this.getAttribute("$timestamp","yes") === "yes";
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
SAMLoaderWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$tiddler"] || changedAttributes["$field"] || changedAttributes["$index"] || changedAttributes["$value"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

function loadSAM() {
    console.log("running sam-loader");
    var samTitle = '$:/plugins/neumark/syncadaptormanager/sam.js';
    var sam = require(samTitle);
    $tw.modules.forEachModuleOfType("syncadaptor",function(title,module) {
        if(title !== samTitle && module.adaptorClass) {
            sam.syncadaptorModules[title] = Object.assign({}, module);
            // don't let startup.js find the adoptorClass
            module.adaptorClass = null;
        }
    });
};

/*
Invoke the action associated with this widget
*/
SAMLoaderWidget.prototype.invokeAction = function(triggeringWidget,event) {
	loadSAM();
	return true; // Action was invoked
};

exports["action-sam-load"] = SAMLoaderWidget;

})();
