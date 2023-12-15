import { useResearchPoints } from 'src/hooks/useResearchPoints';
import { ReactComponent as AtomIcon } from 'src/assets/atom.svg';
import { motion } from 'framer-motion';

const ResearchPoints = () => {
  const { data } = useResearchPoints();

  if (data === null || data === undefined)
    return (
      // Placeholder to prevent layout shift
      <div className="relative bottom-2 font-display text-base pr-5 sm:bottom-0 sm:top-1 max-w-7xl m-auto flex justify-end items-center invisible">
        <AtomIcon className="relative mr-1 h-5 w-5" />
        <span className="invisible">Placeholder</span>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="relative bottom-2 font-display text-base pr-5 sm:bottom-0 sm:top-1 max-w-7xl m-auto flex justify-end items-center">
        <AtomIcon className="relative mr-1 h-5 w-5" />
        <span>{data}</span>
      </div>
    </motion.div>
  );
};

export { ResearchPoints };
