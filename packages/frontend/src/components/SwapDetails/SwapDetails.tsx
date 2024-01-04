import { ReactComponent as GasIcon } from 'src/assets/icons/gas.svg';
import { useGasFee } from 'src/hooks/useGasFee';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="w-5 h-5 mr-2 opacity-0">
        <GasIcon />
      </div>
    </div>
  );
};

const SwapDetails = () => {
  return (
    <div className="flex justify-between pt-2 px-4 text-smoke">
      <GasFee />
      {/* TODO: Path goes here */}
    </div>
  );
};

export { SwapDetails };
