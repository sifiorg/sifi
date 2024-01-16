import { Token } from '@sifi/sdk';
import { numberWithCommas, toDecimalPlaces } from '@sifi/shared-ui';
import { FC } from 'react';
import { useUsdValue } from 'src/hooks/useUsdValue';
import { getChainById, getChainIcon } from 'src/utils/chains';
import MissingTokenIcon from 'src/assets/icons/missing-token-icon.svg';

type SwapSideSummaryProps = {
  token: Token;
  amount: string;
};

const SwapSideSummary: FC<SwapSideSummaryProps> = ({ token, amount }) => {
  const usdValue = useUsdValue({
    address: token.address,
    chainId: token.chainId,
    amount: amount,
  });

  const chain = getChainById(token.chainId);

  const formattedUsdValue = usdValue
    ? numberWithCommas(toDecimalPlaces(String(usdValue), 2))
    : undefined;

  return (
    <div className="flex">
      <div className="relative h-12 w-12 flex-shrink-0">
        <img
          className="h-12 w-12 rounded-full"
          src={token.logoURI}
          alt={`${token.name} logo`}
          onError={e => {
            (e.target as HTMLImageElement).src = MissingTokenIcon;
          }}
        />
        <img
          alt={`${chain.name}-icon`}
          className="drop-shadow-xs-strong absolute bottom-[-6px] right-[-6px] block h-6 w-6 rounded-full"
          src={getChainIcon(chain.id)}
        />
      </div>
      <div>
        <div className="font-display text-2xl pl-4">
          {amount} {token?.symbol}
        </div>
        <div className="pl-4 text-smoke">
          {formattedUsdValue && `≈ $${formattedUsdValue} | `}
          {token.symbol} on {chain.name}{' '}
        </div>
      </div>
    </div>
  );
};

export { SwapSideSummary };
export type { SwapSideSummaryProps };
