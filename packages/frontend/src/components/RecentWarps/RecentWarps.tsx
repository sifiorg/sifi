import { Table, formatTokenAmount, Skeleton } from '@sifi/shared-ui';
import { FunctionComponent } from 'react';
import { useRecentWarps } from 'src/hooks/useRecentWarps';
import { useTokens } from 'src/hooks/useTokens';
import { getIconFromSymbol } from 'src/utils';
import { Stats } from '../Stats/Stats';

const RecentWarpsTableData: FunctionComponent = () => {
  const { data: warps, error, isLoading } = useRecentWarps();
  const { fromTokens } = useTokens();

  if (error) {
    return (
      <Table.Row width="100%">
        <Table.Cell className="text-center">
          <span className="dark:text-punk-red">Something went wrong loading the recent warps</span>
        </Table.Cell>
      </Table.Row>
    );
  }

  if (isLoading) {
    return (
      <>
        {new Array(5).fill(0).map((_, index) => (
          <Table.Row key={`recent-shifts-table-skeleton-${index}`}>
            <Table.Cell width="100%" className="text-center">
              <Skeleton className="sm:h-10 sm:w-100 m-auto rounded-md h-20" />
            </Table.Cell>
          </Table.Row>
        ))}
      </>
    );
  }

  return (
    <>
      {warps?.map(warp => {
        return (
          <Table.Row className="overflow-y-auto max-w-xs m-auto sm:max-w-none" key={warp.addedAt}>
            <Table.Cell className="mb-2 w-full sm:mb-0">
              <div className="mx-auto grid items-center sm:grid-cols-[3fr_1fr_3fr]">
                <div className="mb-4 grid grid-cols-[1fr_3fr] sm:mb-0 sm:inline-block sm:pl-8">
                  <span className="dark:text-flashbang-white text-new-black font-medium uppercase sm:hidden">
                    From
                  </span>
                  <div className="flex items-center">
                    <img
                      className="mr-3 h-6 w-6 rounded-full"
                      src={getIconFromSymbol(warp.tokenIn.symbol, fromTokens)}
                      alt="Logo"
                    />
                    <span>{`${formatTokenAmount(warp.amountInDecimal)} ${
                      warp.tokenIn.symbol
                    }`}</span>
                  </div>
                </div>

                <div className="hidden sm:flex justify-center">
                  <svg
                    width="28"
                    height="18"
                    viewBox="0 0 28 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0071 0.547428L14.0071 0.547448L14.0115 0.549962L27.3296 8.24029C27.3296 8.24029 27.3296 8.2403 27.3296 8.2403C27.4515 8.31087 27.5 8.41639 27.5 8.51844C27.5 8.62043 27.4505 8.73883 27.3201 8.8242L14.0178 16.5053C13.7521 16.6459 13.4718 16.384 13.5572 16.1278L13.5583 16.1245L14.8253 12.235L15.0386 11.5801L14.3499 11.5801L0.825046 11.5801C0.6413 11.5801 0.5 11.4326 0.5 11.2551L0.5 5.80389C0.5 5.62014 0.647488 5.47884 0.825046 5.47884L14.3499 5.47884L15.0386 5.47884L14.8253 4.82397L13.5591 0.936954C13.559 0.936609 13.5589 0.936265 13.5588 0.935922C13.457 0.615508 13.7747 0.410049 14.0071 0.547428Z"
                      stroke="#B4BBC6"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-[1fr_3fr] sm:inline-block">
                  <span className="dark:text-flashbang-white text-new-black font-medium uppercase sm:hidden">
                    To
                  </span>
                  <div className="flex items-center sm:pl-8">
                    <img
                      className="mr-3 h-6 w-6 rounded-full"
                      src={getIconFromSymbol(warp.tokenOut.symbol, fromTokens)}
                      alt="Logo"
                    />
                    <span>{`${formatTokenAmount(warp.amountOutDecimal)} ${
                      warp.tokenOut.symbol
                    }`}</span>
                  </div>
                </div>
              </div>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </>
  );
};

const RecentWarps: FunctionComponent = () => {
  return (
    <section>
      <div className="mx-auto w-full max-w-2xl py-16">
        <div className="flex flex-col items-center justify-between gap-2">
          <h2 className="text-center text-3xl">Recent</h2>
          <Stats />
          <div className="dark:border-darker-gray border-smoke w-full border-t mt-4">
            <Table>
              <thead>
                <Table.Row>
                  <Table.Heading className="w-full">
                    <div className="mx-auto grid max-w-2xl sm:grid-cols-[3fr_1fr_3fr]">
                      <span className="font-text col-span-2 inline-block font-medium sm:pl-8">
                        From
                      </span>
                      <span className="font-text font-medium sm:pl-8">To</span>
                    </div>
                  </Table.Heading>
                </Table.Row>
              </thead>
              <Table.Body>
                <RecentWarpsTableData />
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export { RecentWarps };
