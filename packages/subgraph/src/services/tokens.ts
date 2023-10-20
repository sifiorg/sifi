import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ERC20 } from '../../generated/SifiDiamond/ERC20';
import { Token } from '../../generated/schema';
import { isZeroAddress } from '../helpers';
import { BIGINT_EIGHTEEN, ZERO_ADDRESS } from '../constants';

export class TokenInfo {
  constructor(
    readonly name: string | null,
    readonly symbol: string | null,
    readonly decimals: i32
  ) {}

  static fromAddress(address: Address): TokenInfo {
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

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (token === null) {
    if (isZeroAddress(address)) {
      token = new Token(ZERO_ADDRESS);
      token.address = address;
      token.decimals = BIGINT_EIGHTEEN;

      // TODO: Add a map for chains like MATIC, BNB, AVAX, etc.
      token.symbol = 'ETH';

      token.save();
    } else {
      let info = TokenInfo.fromAddress(address);

      token = new Token(address.toHexString());
      token.address = address;
      token.name = info.name;
      token.symbol = info.symbol;
      token.decimals = BigInt.fromI32(info.decimals);

      token.save();
    }
  }

  return token;
}
