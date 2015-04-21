#!/bin/bash

set -e
verbose=false

while test $# != 0
do
    case "$1" in
        "-v") verbose=true;;
        "--verbose") verbose=true;;
	"--platform") platform=$2;;
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
run_cmd npm install .
cordova="$(npm bin)/cordova"
$cordova >/dev/null 2>&1 || { echo >&2 "Error: Please install cordova CLI first (npm install -g cordova)"; exit 1; }
if [ "$platform" == "mac" ]; then
    echo "Adding platforms iOS and Android"
    run_cmd $cordova platforms add ios android || { run_cmd $cordova platforms rm ios android; run_cmd $cordova platforms add ios android; }
else
    echo "Adding platform Android"
    run_cmd $cordova platforms add android || { run_cmd $cordova platforms rm android; run_cmd $cordova platforms add android; }
fi
echo "Adding cordova plugins"
set +e
run_cmd $cordova plugin rm org.apache.cordova.core.contacts
run_cmd $cordova plugin rm org.apache.cordova.core.dialogs
run_cmd $cordova plugin rm org.apache.cordova.contacts
run_cmd $cordova plugin rm org.apache.cordova.dialogs
set -e
run_cmd $cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-contacts.git
run_cmd $cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-dialogs.git
if [ "$platform" == "mac" ]; then
    echo "Building apps for iOS and Android"
else
    echo "Building apps Android"
fi
run_cmd $cordova build
echo "Run 'cordova emulate ios' or 'cordova emulate android' to launch apps"
