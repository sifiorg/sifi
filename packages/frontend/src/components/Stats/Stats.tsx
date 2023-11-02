import { useAllTimeStats } from 'src/hooks/useAllTimeStats';
import { numberWithCommas } from 'src/utils/numberWithCommas';

const Stats = () => {
  const { error, data } = useAllTimeStats();

  if (error) {
    console.error('Failed to fetch all-time stats:', error);
  }

  return (
    <div className="font-display m-auto text-center text-sm p-1 pb-0 flex place-items-center justify-center relative">
      {data ? (
        `All-time volume: $${numberWithCommas(data)}`
      ) : (
        // To avoid layout shifts
        <span className="invisible">Placehodler</span>
      )}
    </div>
  );
};

export { Stats };
