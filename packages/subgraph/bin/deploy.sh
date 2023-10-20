#!/usr/bin/env bash
set -eu -o pipefail; cd "$(dirname "$0")/.."

if [ $# -ne 1 ]; then
  echo "Usage: $0 <network>"
  exit 1
fi

network="$1"

if [ "$network" == "mainnet" ]; then
  subgraph="sifi"
else
  subgraph="sifi-$network"
fi

graph deploy --network "$network" --node https://api.studio.thegraph.com/deploy/ "$subgraph"
