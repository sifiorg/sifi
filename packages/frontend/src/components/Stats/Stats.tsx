import { useAllTimeStats } from 'src/hooks/useAllTimeStats';
import { numberWithCommas } from 'src/utils/numberWithCommas';

const Stats = () => {
  const { error, data } = useAllTimeStats();

  if (error) {
    console.error('Failed to fetch all-time stats:', error);
  }

  return (
    <div className="m-auto font-text text-center pb-2 flex place-items-center justify-center relative text-smoke">
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
