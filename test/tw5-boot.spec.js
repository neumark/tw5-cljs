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
  console.log('Cleaning up temp dirs');
  tmpDirs.forEach(t => {
      console.log("deleting", t);
      deleteFolderRecursive(t);
  });
});

const tiddlywikiInfo = {
    "description": "Basic client-server edition",
    "plugins": [
        "tiddlywiki/tiddlyweb",
        "tiddlywiki/filesystem",
        "tiddlywiki/highlight",
        "neumark/literate-code",
        "neumark/node-shell-exec",
        "neumark/clj-support",
        "neumark/syncadaptormanager",
        "neumark/redefine-modules",
        "neumark/sam-browser-firestore"
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

const twInit = (options) => {
    const tmpdir = tmp.dirSync().name;
    options = options || {};
    tmpDirs.push(tmpdir);
    // write tiddlywiki.info to newly created dir.
    return util.promisify(fs.writeFile)(
        path.resolve(tmpdir, "tiddlywiki.info"),
        JSON.stringify(options.twInfo || tiddlywikiInfo))
      .then(() => tw5.initTiddlywiki({
          preloadTiddlers: options.preloadTiddlers,
          argv: `${tmpdir} --version`.split(" ")}));
  };

const makeCLJSTiddler = (title, text) => {
    const tiddler = {
        title,
        text,
        type: "text/x-clojure"
    }
    tiddler["module-type"] = "library";
    return tiddler;
};

describe("test", function (done) {

  it("built-in tiddlers can be found", function (done) {
    twInit().then($tw => {
        expect($tw.wiki.tiddlerExists("$:/boot/boot.js")).toBe(true);
        done();
    });
  });

  it("cljs tiddler are evaluated", function (done) {
    twInit({preloadTiddlers: [
        makeCLJSTiddler(
            "test.cljs",
            `(ns my.test6a)
            (js/console.log "declaring foobar1")
            (defn ^:export foobar1 [x]
            (+ 1 (* 3 x)))`)
    ]}).then($tw => {
        console.log("cljstest");
        expect($tw.wiki.tiddlerExists("test.cljs")).toBe(true);
        expect(Object.keys($tw.modules.titles["test.cljs"].exports)).toBe(["foobar1"]);
        done();
    });
  });

  it("filesystem syncer is available", function (done) {
    twInit().then($tw => {
        expect($tw.syncadaptor.name).toBe("filesystem");
        done();
    });
  });

}); 
