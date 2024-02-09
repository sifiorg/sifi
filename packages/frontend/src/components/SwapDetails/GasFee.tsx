import { Quote } from '@sifi/sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as GasIcon } from 'src/assets/icons/gas.svg';
import { useGasFee } from 'src/hooks/useGasFee';

type GasFeeProps = {
  quote: Quote | null;
};

const GasFee: React.FC<GasFeeProps> = ({ quote }) => {
  const { gasFeeEstimateUsd } = useGasFee(quote);

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

export { GasFee };
