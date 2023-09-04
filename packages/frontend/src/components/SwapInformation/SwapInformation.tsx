import { Skeleton } from '@sifi/shared-ui';
import { FunctionComponent } from 'react';
import { useQuote } from 'src/hooks/useQuote';
import { formatTokenAmount } from 'src/utils';

const SwapInformation: FunctionComponent = () => {
  const { quote, isLoading } = useQuote();

  if (isLoading || !quote) {
    return (
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {/* TODO: Add this back in */}
        {/* <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">USD Value</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {route.toAmountUSD} USD
            </dd>
          </div> */}
        <div className="sm:col-span-1">
          <dt className="text-smoke text-sm font-medium">Estimated Gas Cost</dt>
          <dd className="font-display text-flashbang-white mt-1 text-sm">
            <Skeleton className="w-24 h-5" />
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
      {/* TODO: Add this back in */}
      {/* <div className="sm:col-span-1">
            <dt className="text-smoke text-sm font-medium">USD Value</dt>
            <dd className="font-display text-flashbang-white mt-1 text-sm">
              {route.toAmountUSD} USD
            </dd>
          </div> */}
      <div className="sm:col-span-1">
        <dt className="text-smoke text-sm font-medium">Estimated Gas Cost</dt>
        <dd className="font-display text-flashbang-white mt-1 text-sm">
          {formatTokenAmount(quote.estimatedGas.toString(), 4)} USD
        </dd>
      </div>
    </dl>
  );
};

export { SwapInformation };
