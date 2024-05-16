#!/bin/bash

if [ -s "$NVM_DIR/nvm.sh" ]; then
  export NVM_DIR="/.nvm"
  . "$NVM_DIR/nvm.sh"

  # Create symlinks to nvm binaries
  ln -sf "$NVM_DIR/versions/node/$(nvm version)/bin/node" ./node
  ln -sf "$NVM_DIR/versions/node/$(nvm version)/bin/npm" ./npm
fi

[[ ! -z "$MUP_ENV_FILE_VERSION" ]] && { echo "Long Env is enabled."; source /etc/app/env.txt; }

echo "Node version"
echo $(./node --version)
echo "Npm version"
echo $(./npm --version)

export METEOR_SETTINGS=$(./node -e 'console.log(decodeURIComponent(process.env.METEOR_SETTINGS_ENCODED))')

echo "=> Starting health check server"
./node health-check.js &

echo "=> Starting App"
./node main.js
