#!/bin/bash
rm -rf ./dist ./tsc &&
tsc -p tsconfig.build.json &&
node ./esbuild.js
