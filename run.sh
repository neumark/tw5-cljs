#!/usr/bin/env bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
export TIDDLYWIKI_PLUGIN_PATH="$DIR/src/plugins"
node $NODE_OPTS $DIR/src/tiddlywiki.js $DIR $@
