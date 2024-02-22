import { motion, AnimatePresence } from 'framer-motion';
import { EitherQuoteSifiAction, Quote } from '@sifi/sdk';
import { ReactComponent as UniswapIcon } from 'src/assets/bridges/uniswap.svg';
import { ReactComponent as CurveIcon } from 'src/assets/bridges/curve.svg';
import { ReactComponent as StargateIcon } from 'src/assets/bridges/stargate.svg';
import { ReactComponent as ArrowRight } from 'src/assets/arrow-right.svg';

type SwapPathProps = {
  quote: Quote | null;
};

type StepDetails = {
  [key: string]: { icon: JSX.Element; name: string };
};

type Step = {
  icon: JSX.Element;
  name: string;
};

const iconClassName = 'w-4 h-4 border-smoke border rounded-full';

const stepDetails: StepDetails = {
  uniswap: { icon: <UniswapIcon className={iconClassName} />, name: 'Uniswap' },
  stargate: { icon: <StargateIcon className={iconClassName} />, name: 'Stargate' },
  curve: { icon: <CurveIcon className={iconClassName} />, name: 'Curve' },
};

type StepInfo = {
  icon: JSX.Element;
  name: string;
};

const getStepDetailsFromAction = (action: EitherQuoteSifiAction): StepInfo | null => {
  if ('exchange' in action) {
    const exchange = action.exchange.toLowerCase();

    for (let key in stepDetails) {
      const regex = new RegExp(key, 'i');

      if (regex.test(exchange)) {
        const detail = stepDetails[key];

        if (detail) {
          return {
            icon: detail.icon,
            name: detail.name,
          };
        }
      }
    }
  }
  return null;
};

const SwapPath: React.FC<SwapPathProps> = ({ quote }) => {
  if (!quote || !('element' in quote.source.quote) || !quote.source.quote.element.actions) {
    return null;
  }

  const steps: Step[] = quote.source.quote.element.actions.reduce((acc: Step[], action) => {
    if (action.type === 'split') {
      action.parts.forEach(part => {
        part.actions.forEach(partAction => {
          const step = getStepDetailsFromAction(partAction);
          if (step) acc.push(step);
        });
      });
    } else {
      const step = getStepDetailsFromAction(action);
      if (step) acc.push(step);
    }
    return acc;
  }, []);

  // The UI can only fit 6 steps
  const lastSteps = steps.slice(-6);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="flex items-center"
      >
        {lastSteps.map((step, index) => (
          <div key={index}>
            <div className="flex text-sm items-center">
              {step.icon && <div className="mx-1">{step.icon}</div>}
              {step.name && steps.length < 4 && (
                <div className="hidden xs:block ml-1">{step.name}</div>
              )}
              {step.icon && index !== steps.length - 1 && <ArrowRight className="w-4 mx-1" />}
            </div>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export { SwapPath };
