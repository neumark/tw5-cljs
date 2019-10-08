const tmp = require('tmp');
const tw5 = require("../src/tiddlywiki.js");
const fs = require('fs');
const path = require('path');
const util = require('util');

describe("test", function (done) {

  var tmpobj;
  var $twPromise;

  beforeEach(function() {
    tmpobj = tmp.dirSync();
    console.log('Created temp dir: ', tmpobj.name);
    // copy tiddlywiki.info to newly created dir.
    $twPromise = util.promisify(fs.copyFile)(
        path.resolve(__dirname, "tiddlywiki.info"),
        path.resolve(tmpobj.name, "tiddlywiki.info"))
      .then(() => tw5.initTiddlywiki({
              preboot: $tw => $tw.hooks.addHook('th-server-command-post-start', (s) => console.log("server", s)),
              wikiPath: tmpobj.name,
              argv: `${tmpobj.name} --verbose --listen host=127.0.0.1 port=58080`.split(" ")
          }));
  });

  afterEach(function() {
    tmpobj.removeCallback();
  });

  it("boot", function (done) {
    console.log("in test");
    $twPromise.then($tw => {
        expect($tw.wiki.tiddlerExists("$:/boot/boot.js")).toBe(true);
        done();
    });
  });
}); 
