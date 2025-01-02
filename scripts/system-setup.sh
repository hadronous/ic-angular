#!/bin/bash

# Assumes that ~/bin is already added to PATH
BIN="$HOME/bin"
mkdir -p $BIN

# Set up OS dependencies
echo "****** SYSTEM SETUP: Installing OS dependencies ******"
sudo apt update
sudo apt install python3-pip

# Set up Commitizen
echo "****** SYSTEM SETUP: Installing Commitizen ******"
pip install --user -U Commitizen

echo "****** SYSTEM SETUP: Commitizen version ******"
cz version

# Set up Pre-Commit
echo "****** SYSTEM SETUP: Installing Pre-Commit ******"
pip install --user -U pre-commit

echo "****** SYSTEM SETUP: Pre-Commit version ******"
pre-commit --version

# Install FNM
echo "****** SYSTEM SETUP: Installing FNM ******"
curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell --install-dir ~/.fnm

echo "****** SYSTEM SETUP: FNM version ******"
export PATH="~/.fnm:$PATH"
fnm --version

# Set up NodeJS
echo "****** SYSTEM SETUP: Installing NodeJS ******"
fnm install
fnm use

echo "****** SYSTEM SETUP: NodeJS version ******"
node --version

echo "****** SYSTEM SETUP: NPM version ******"
npm --version

# Set up PNPM
echo "****** SYSTEM SETUP: Installing PNPM ******"
corepack enable

echo "****** SYSTEM SETUP: PNPM version ******"
pnpm --version

# Set up DFX
echo "****** SYSTEM SETUP: Installing DFXVM ******"
DFX_VERSION=$(jq -r '.dfx' ./dfx.json)
DFXVM_INIT_YES=true DFX_VERSION=$DFX_VERSION sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

if [[ "$OSTYPE" == "darwin"* ]]; then
  source "$HOME/Library/Application Support/org.dfinity.dfx/env"
else
  source "$HOME/.local/share/dfx/env"
fi

echo "****** SYSTEM SETUP: DFX version ******"
dfx --version
