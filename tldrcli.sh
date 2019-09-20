#!/usr/bin/env bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi
java -jar $DIR/../tldr/tldrcli/target/uberjar/tldrcli-0.1.0-SNAPSHOT-standalone.jar $@
