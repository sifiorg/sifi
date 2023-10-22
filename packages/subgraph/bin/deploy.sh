#!/usr/bin/env bash
set -eu -o pipefail; cd "$(dirname "$0")/.."

if [ $# -ne 1 ]; then
  echo "Usage: $0 <network>"
  exit 1
fi

network="$1"

# Must be a key in networks.json
if ! jq -e ".\"$network\"" networks.json > /dev/null; then
  echo "Unknown network: $network"
  exit 1
fi

if [ "$network" == "mainnet" ]; then
  subgraph="sifi"
else
  subgraph="sifi-$network"
fi

version=$(jq -r '.version' package.json)

echo "When prompted, enter version: v$version"

graph deploy --network "$network" --node https://api.studio.thegraph.com/deploy/ "$subgraph"
