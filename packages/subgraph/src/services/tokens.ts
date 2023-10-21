import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/SifiDiamond/ERC20';
import { Token } from '../../generated/schema';
import { Memoizer, isZeroAddress } from '../helpers';

export class TokenInfo {
  constructor(
    readonly name: string | null,
    readonly symbol: string | null,
    readonly decimals: i32
  ) {}

  static fromAddress(address: Address): TokenInfo {
    if (isZeroAddress(address)) {
      // TODO: Change for chains with different native tokens
      return new TokenInfo('Ether', 'ETH', 18);
    }

    let erc20 = ERC20.bind(address);

    let name = erc20.try_name();
    let symbol = erc20.try_symbol();
    let decimals = erc20.try_decimals();

    return new TokenInfo(
      name.reverted ? '' : name.value.toString(),
      symbol.reverted ? '' : symbol.value.toString(),
      decimals.reverted ? 18 : decimals.value
    );
  }
}

export const memTokenInfoFromAddress = new Memoizer<Address, TokenInfo>(TokenInfo.fromAddress);

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (token === null) {
    const info = memTokenInfoFromAddress.get(address);

    token = new Token(address.toHexString());
    token.address = address;
    token.name = info.name;
    token.symbol = info.symbol;
    token.decimals = BigInt.fromI32(info.decimals);

    token.save();
  }

  return token;
}
