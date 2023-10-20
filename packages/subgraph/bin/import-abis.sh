#!/usr/bin/env bash
set -eu -o pipefail; cd "$(dirname "$0")/.."

source_dir="../hardhat/artifacts/contracts/interfaces/"
source_names="ILibWarp ILibStarVault"
source_filenames=$(for name in $source_names; do echo -n "$source_dir$name.sol/$name.json "; done)

jq -s 'map(.abi) | add | unique_by(.name, .type)' $source_filenames > abis/SifiDiamond.json

jq .abi ../hardhat/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json > abis/ERC20.json
