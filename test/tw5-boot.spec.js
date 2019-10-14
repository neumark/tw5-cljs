const tmp = require('tmp');
const tw5 = require("../src/tiddlywiki.js");
const fs = require('fs');
const path = require('path');
const util = require('util');

const tmpDirs = [];

// from: https://stackoverflow.com/a/32197381
var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        console.log("deleting file", curPath);
        fs.unlinkSync(curPath);
      }
    });
    console.log("deleting dir", path);
    fs.rmdirSync(path);
  }
};

process.on('beforeExit', (code) => {
  console.log('Cleaning up temp dirs', code);
  tmpDirs.forEach(t => {
      console.log("deleting", t);
      deleteFolderRecursive(t);
  });
});

describe("test", function (done) {

  var tmpobj;
  var $twPromise;

  const tiddlywikiInfo = {
    "description": "Basic client-server edition",
    "plugins": [
        "tiddlywiki/tiddlyweb",
        "tiddlywiki/filesystem",
        "tiddlywiki/highlight",
        "tiddlywiki/markdown",
        "neumark/literate-code",
        "neumark/node-shell-exec",
        "neumark/clj-support",
        "neumark/syncadaptormanager",
        "neumark/redefine-modules",
        "neumark/sam-browser-firestore",
        "tiddlywiki/codemirror",
		"tiddlywiki/codemirror-closebrackets",
		"tiddlywiki/codemirror-closetag",
		"tiddlywiki/codemirror-autocomplete",
		"tiddlywiki/codemirror-search-replace",
		"tiddlywiki/codemirror-fullscreen-editing",
		"tiddlywiki/codemirror-mode-xml",
		"tiddlywiki/codemirror-mode-javascript",
		"tiddlywiki/codemirror-mode-css",
		"tiddlywiki/codemirror-mode-x-tiddlywiki",
		"tiddlywiki/codemirror-mode-markdown",
		"tiddlywiki/codemirror-keymap-sublime-text"
    ],
    "themes": [
        "tiddlywiki/vanilla",
        "tiddlywiki/snowwhite"
    ],
    "build": {
        "index": [
            "--rendertiddler",
            "$:/plugins/tiddlywiki/tiddlyweb/save/offline",
            "index.html",
            "text/plain"
        ],
        "externalimages": [
            "--savetiddlers",
            "[is[image]]",
            "images",
            "--setfield",
            "[is[image]]",
            "_canonical_uri",
            "$:/core/templates/canonical-uri-external-image",
            "text/plain",
            "--setfield",
            "[is[image]]",
            "text",
            "",
            "text/plain",
            "--rendertiddler",
            "$:/plugins/tiddlywiki/tiddlyweb/save/offline",
            "externalimages.html",
            "text/plain"
        ],
        "static": [
            "--rendertiddler",
            "$:/core/templates/static.template.html",
            "static.html",
            "text/plain",
            "--rendertiddler",
            "$:/core/templates/alltiddlers.template.html",
            "alltiddlers.html",
            "text/plain",
            "--rendertiddlers",
            "[!is[system]]",
            "$:/core/templates/static.tiddler.html",
            "static",
            "text/plain",
            "--rendertiddler",
            "$:/core/templates/static.template.css",
            "static/static.css",
            "text/plain"
        ]
    }
  };

  beforeEach(function() {
    tmpobj = tmp.dirSync();
    tmpDirs.push(tmpobj.name);
    console.log('Created temp dir: ', tmpobj.name);
    // copy tiddlywiki.info to newly created dir.
    $twPromise = util.promisify(fs.writeFile)(
        path.resolve(tmpobj.name, "tiddlywiki.info"),
        JSON.stringify(tiddlywikiInfo))
      .then(() => tw5.initTiddlywiki({argv: `${tmpobj.name} --version`.split(" ")}));
  });

  it("built-in tiddlers can be found", function (done) {
    $twPromise.then($tw => {
        expect($tw.wiki.tiddlerExists("$:/boot/boot.js")).toBe(true);
        done();
    });
  });

/*
  it("cljs tiddler are evaluated", function (done) {
    $twPromise.then($tw => {
        expect($tw.wiki.tiddlerExists("$:/boot/boot.js")).toBe(true);
        done();
    });
  });
*/

  it("filesystem syncer is available", function (done) {
    $twPromise.then($tw => {
        expect($tw.syncadaptor.name).toBe("filesystem");
        done();
    });
  });

}); 
