#!/usr/bin/env bash
set -eu -o pipefail; cd "$(dirname "$0")/.."

networks=$(jq -r 'keys|.[]' ../subgraph/deployments.json)

# Output as: { "chainId1": "url1", "chainId2": "url2" }
output="{}"

for network in $networks; do
  # Get url from deployments.json value of the network key
  url=$(jq -r ".\"$network\"" ../subgraph/deployments.json)

  # Get chain id from networks-more.json with key $network field chainId
  chain_id=$(jq -r ".\"$network\".chainId" ../subgraph/networks-more.json)

  # Add to output
  output=$(jq -n --argjson output "$output" --arg chain_id "$chain_id" --arg url "$url" '$output + { ($chain_id): $url }')
done

echo "$output" > src/subgraph.json
