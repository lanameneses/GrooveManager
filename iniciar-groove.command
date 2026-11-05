#!/bin/zsh

cd "$(dirname "$0")/backend" || exit 1

brew services start mysql

npm start &
SERVIDOR=$!

sleep 2

open http://localhost:3000

wait $SERVIDOR