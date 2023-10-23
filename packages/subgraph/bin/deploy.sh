#!/usr/bin/env bash
set -eu -o pipefail; cd "$(dirname "$0")/.."

if [ $# -ne 1 ]; then
  echo "Usage: $0 <network>"
  exit 1
fi

network="$1"

# Must be a key in networks.json
if ! jq -e ".\"$network\"" networks.json > /dev/null; then
  echo "Network missing from networks.json: $network"
  exit 1
fi

# Must be a key in networks-more.json
if ! network_def=$(jq -e ".\"$network\"" networks-more.json); then
  echo "Network missing from networks-more.json: $network"
  exit 1
fi

if [ "$network" == "mainnet" ]; then
  subgraph="sifi"
else
  subgraph="sifi-$network"
fi

product=$(echo "$network_def" | jq -r '.product')

if [ "$product" == "subgraph-studio" ]; then
  version=$(jq -r '.version' package.json)
  echo "When prompted, enter version: v$version"

  graph deploy --product subgraph-studio --network "$network" --node https://api.studio.thegraph.com/deploy/ "$subgraph"
elif [ "$product" == "hosted-service" ]; then
  graph deploy --product hosted-service --network "$network" "sifiorg/$subgraph"
else
  echo "Unknown product: $product"
  exit 1
fi
