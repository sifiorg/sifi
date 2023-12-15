import { useResearchPoints } from 'src/hooks/useResearchPoints';
import { motion } from 'framer-motion';

const ResearchPoints = () => {
  const { data } = useResearchPoints();

  if (data === null || data === undefined)
    return (
      // Placeholder to prevent layout shift
      <div className="text-right relative bottom-3 font-display text-base pr-5 sm:bottom-0 invisible">
        <span className="text-2xl relative top-[0.075rem] pr-1"></span>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="text-right relative bottom-3 font-display text-base pr-5 sm:bottom-0">
        <span className="text-2xl relative top-[0.075rem] pr-1">⚛️</span>
        <span>{data}</span>
      </div>
    </motion.div>
  );
};

export { ResearchPoints };
