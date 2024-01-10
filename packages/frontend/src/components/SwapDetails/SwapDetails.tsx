import { ReactComponent as GasIcon } from 'src/assets/icons/gas.svg';
import { useGasFee } from 'src/hooks/useGasFee';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuote } from 'src/hooks/useQuote';
import { EitherQuoteSifiAction } from '@sifi/sdk';
import { ReactComponent as UniswapIcon } from 'src/assets/bridges/uniswap.svg';
import { ReactComponent as CurveIcon } from 'src/assets/bridges/curve.svg';
import { ReactComponent as StargateIcon } from 'src/assets/bridges/stargate.svg';
import { ReactComponent as ArrowRight } from 'src/assets/arrow-right.svg';

type ExchangeDetails = {
  [key: string]: { icon: JSX.Element; name: string } | undefined;
};

type Step = {
  icon: JSX.Element | null;
  exchangeName: string | null;
};

const iconClassName = 'w-4 h-4 border-smoke border rounded-full';

const exchangeDetails: ExchangeDetails = {
  uniswap: { icon: <UniswapIcon className={iconClassName} />, name: 'Uniswap' },
  stargate: { icon: <StargateIcon className={iconClassName} />, name: 'Stargate' },
  curve: { icon: <CurveIcon className={iconClassName} />, name: 'Curve' },
};

const getIconForExchange = (action: EitherQuoteSifiAction) => {
  if ('exchange' in action) {
    const exchange = action.exchange.toLowerCase();

    for (let key in exchangeDetails) {
      const regex = new RegExp(key, 'i');

      if (regex.test(exchange)) {
        return exchangeDetails[key]?.icon || null;
      }
    }
  }
  return null;
};

const getExchangeName = (action: EitherQuoteSifiAction): string | null => {
  if ('exchange' in action) {
    const exchange = action.exchange.toLowerCase();

    for (let key in exchangeDetails) {
      const regex = new RegExp(key, 'i');

      if (regex.test(exchange)) {
        return exchangeDetails[key]?.name || null;
      }
    }
  }
  return null;
};

const GasFee = () => {
  const { gasFeeEstimateUsd } = useGasFee();

  return (
    <div className="relative flex items-center">
      <div className="absolute">
        <AnimatePresence>
          {gasFeeEstimateUsd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center text-sm"
            >
              <GasIcon className="fill-smoke w-4 h-4 mr-2" />
              <span className="min-w-[7rem]">${gasFeeEstimateUsd}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Placeholder to maintain layout */}
      <div className="w-4 h-4 mr-2 opacity-0">
        <GasIcon />
      </div>
    </div>
  );
};

const Path = () => {
  const { quote } = useQuote();

  if (!quote || !('element' in quote.source.quote) || !quote.source.quote.element.actions) {
    return null;
  }

  let steps: Step[] = [];

  quote.source.quote.element.actions.forEach(action => {
    if (action.type === 'split') {
      action.parts.forEach(part => {
        part.actions.forEach(partAction => {
          const icon = getIconForExchange(partAction);
          const exchangeName = getExchangeName(partAction);

          if (!icon || !exchangeName) return;

          steps.push({ icon, exchangeName });
        });
      });
    } else {
      const icon = getIconForExchange(action);
      const exchangeName = getExchangeName(action);

      if (!icon || !exchangeName) return;

      steps.push({ icon, exchangeName });
    }
  });

  // The UI can only fit 6 steps
  steps = steps.slice(-6);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="flex items-center"
      >
        {steps.map((step, index) => (
          <div key={index}>
            <div className="flex text-sm items-center">
              {step.icon && <div className="mx-1">{step.icon}</div>}
              {step.exchangeName && steps.length < 4 && (
                <div className="hidden xs:block ml-1">{step.exchangeName}</div>
              )}
              {step.icon && index !== steps.length - 1 && <ArrowRight className="w-4 mx-1" />}
            </div>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

const SwapDetails = () => {
  return (
    <div className="flex justify-between min-h-[1.75rem] pt-2 px-4 text-smoke">
      <GasFee />
      <Path />
    </div>
  );
};

export { SwapDetails };
