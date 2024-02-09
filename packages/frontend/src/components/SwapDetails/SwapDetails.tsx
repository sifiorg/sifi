import { useQuote } from 'src/hooks/useQuote';
import { GasFeeUsd } from '../GasFeeUsd/GasFeeUsd';
import { SwapPath } from '../SwapPath/SwapPath';

const SwapDetails = () => {
  const { quote } = useQuote();

  return (
    <div className="flex justify-between min-h-[1.75rem] pt-2 px-4 text-smoke">
      {quote && (
        <>
          <GasFeeUsd gas={quote.estimatedGas} chainId={quote.fromToken.chainId} />
          <SwapPath quote={quote} />
        </>
      )}
    </div>
  );
};

export { SwapDetails };
