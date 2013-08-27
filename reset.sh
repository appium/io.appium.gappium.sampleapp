#!/bin/bash

set -e
verbose=false

while test $# != 0
do
    case "$1" in
        "-v") verbose=true;;
        "--verbose") verbose=true;;
    esac
    shift
done

run_cmd() {
    if $verbose ; then
        "$@"
    else
        "$@" >/dev/null 2>&1
    fi
}

echo "Initializing repo"
run_cmd git submodule update --init
cordova >/dev/null 2>&1 || { echo >&2 "Error: Please install cordova CLI first (npm install -g cordova)"; exit 1; }
echo "Adding platforms iOS and Android"
run_cmd cordova platforms add ios android || { run_cmd cordova platforms rm ios android; run_cmd cordova platforms add ios android; }
echo "Building apps for iOS and Android"
run_cmd cordova build
echo "Run 'cordova emulate ios' or 'cordova emulate android' to launch apps"
