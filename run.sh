#!/usr/bin/env bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
node $NODE_OPTS $DIR/src/tiddlywiki.js $DIR $@
