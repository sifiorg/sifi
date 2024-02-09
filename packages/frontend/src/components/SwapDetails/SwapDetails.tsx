import { useQuote } from 'src/hooks/useQuote';
import { GasFee } from './GasFee';
import { SwapPath } from '../SwapPath/SwapPath';

const SwapDetails = () => {
  const { quote } = useQuote();

  return (
    <div className="flex justify-between min-h-[1.75rem] pt-2 px-4 text-smoke">
      {quote && (
        <>
          <GasFee quote={quote} />
          <SwapPath quote={quote} />
        </>
      )}
    </div>
  );
};

export { SwapDetails };
