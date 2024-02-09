import { motion, AnimatePresence } from 'framer-motion';
import { ReactComponent as GasIcon } from 'src/assets/icons/gas.svg';
import { useGasFeeUsd } from 'src/hooks/useGasFeeUsd';

type GasFeeProps = {
  gas: bigint;
  chainId: number;
};

const GasFeeUsd: React.FC<GasFeeProps> = ({ gas, chainId }) => {
  const { gasFeeUsd } = useGasFeeUsd({ gas, chainId });

  return (
    <div className="relative flex items-center">
      <div className="absolute">
        <AnimatePresence>
          {gasFeeUsd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center text-sm"
            >
              <GasIcon className="fill-smoke w-4 h-4 mr-2" />
              <span className="min-w-[7rem]">${gasFeeUsd}</span>
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

export { GasFeeUsd };
