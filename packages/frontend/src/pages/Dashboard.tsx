import { Skeleton, Table, formatTokenAmount } from '@sifi/shared-ui';
import { FC, useEffect, useState } from 'react';
import { Button } from 'src/components/Button';
import { PartnerTokens, usePartnerTokens } from 'src/hooks/usePartnerTokens';
import { getChainById, getChainIcon } from 'src/utils/chains';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useFetchTokens } from 'src/hooks/useFetchTokens';
import { usePartnerWithdraw } from 'src/hooks/usePartnerWithdraw';
import { ConnectWallet } from 'src/components/ConnectWallet/ConnectWallet';
import { firstAndLast, getEvmTxUrl } from 'src/utils';
import { ETH_CONTRACT_ADDRESS, ETH_ZERO_ADDRESS } from 'src/constants';

const extractTokenAddress = (id: string): string => {
  // The id is a concatenation of two Ethereum addresses,
  // the token address is last 40 characters of the id.
  return '0x' + id.slice(-40);
};

const calculateTotalBalanceUsd = (partnerTokens: PartnerTokens) => {
  return partnerTokens
    ? Object.values(partnerTokens).reduce((total, data) => {
        if (data?.partner?.tokens) {
          const totalForChain = data.partner.tokens.reduce(
            (total, token) => total + parseFloat(token.balanceUsd),
            0
          );
          return total + totalForChain;
        }
        return parseFloat(total.toFixed(2));
      }, 0)
    : 0;
};

const calculateLifetimeEarningsUsd = (partnerTokens: PartnerTokens) => {
  return partnerTokens
    ? Object.values(partnerTokens).reduce((total, data) => {
        if (data?.partner?.tokens) {
          const totalForChain = data.partner.tokens.reduce(
            (total, token) => total + parseFloat(token.balanceUsd) + parseFloat(token.withdrawnUsd),
            0
          );
          return total + totalForChain;
        }
        return parseFloat(total.toFixed(2));
      }, 0)
    : 0;
};

type PartnerTokensTableProps = {
  partnerTokens: PartnerTokens;
};

const PartnerTokensTable: FC<PartnerTokensTableProps> = ({ partnerTokens }) => {
  const { chain: activeChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const chainIds = Object.keys(partnerTokens).map(Number);
  const { fetchTokens, tokensByChainIdAndAddress } = useFetchTokens(chainIds);
  const [withdrawnTokens, setWithdrawnTokens] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTokens();
  }, []);

  const partnerWithdrawMutation = usePartnerWithdraw();

  const handleWithdraw = async (id: string, chainId: number) => {
    const tokenAddress = extractTokenAddress(id);

    if (switchNetwork && chainId !== activeChain?.id) {
      switchNetwork(chainId);
    }

    partnerWithdrawMutation.mutate(
      { tokenAddress, chainId },
      {
        onSuccess: async receipt => {
          if (receipt) {
            // Refetching is not reliable, so we just update the state manually
            setWithdrawnTokens(prev => ({ ...prev, [id]: receipt }));
          }
        },
      }
    );
  };

  return (
    <section>
      <div className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center justify-between gap-2">
          <div className="dark:border-darker-gray border-smoke w-full border-t mt-4">
            <Table>
              <Table.Body>
                {Object.entries(partnerTokens).map(
                  ([chainId, data]) =>
                    data?.partner?.tokens?.map(token => {
                      let tokenAddress = extractTokenAddress(token.id);
                      if (tokenAddress === ETH_ZERO_ADDRESS) {
                        tokenAddress = ETH_CONTRACT_ADDRESS.toLowerCase();
                      }
                      const tokenKey = `${chainId}-${tokenAddress}`;
                      const tokenDetails = tokensByChainIdAndAddress[tokenKey];
                      const showWithdrawalButton =
                        Number(token.balanceDecimal) > 0 && !withdrawnTokens[token.id];
                      const lastWithdrwalHash =
                        withdrawnTokens[token.id] || token.modifiedAtTransaction;
                      const lastWithdrwalUrl = getEvmTxUrl(
                        getChainById(Number(chainId)),
                        withdrawnTokens[token.id] || token.modifiedAtTransaction
                      );

                      return (
                        <Table.Row
                          className="overflow-y-auto max-w-xs m-auto sm:max-w-none my-2"
                          key={token.id}
                        >
                          <Table.Cell className="mb-2 w-full sm:mb-0">
                            <div className="mx-auto grid items-center sm:grid-cols-2">
                              <div className="mb-4 sm:mb-0 sm:inline-block sm:pl-8">
                                <div className="flex items-center justify-center sm:justify-start">
                                  <div className="relative mr-3 ">
                                    <img
                                      className="h-12 w-12 rounded-full"
                                      src={tokenDetails?.logoURI}
                                      alt="Logo"
                                    />
                                    <img
                                      src={getChainIcon(tokenDetails?.chainId)}
                                      className="w-6 h-6 -right-1 -bottom-1 absolute"
                                    />
                                  </div>
                                  <div className="flex flex-col pl-4">
                                    <span>
                                      {formatTokenAmount(token.balanceDecimal)}{' '}
                                      {tokenDetails?.symbol}
                                    </span>
                                    <span className="text-sm">
                                      ≈ {formatTokenAmount(token.balanceUsd)} USD
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex place-items-center align-middle justify-center my-2 sm:m-auto">
                                {showWithdrawalButton ? (
                                  <Button
                                    role="button"
                                    size="small"
                                    onClick={() => handleWithdraw(token.id, Number(chainId))}
                                  >
                                    Withdraw
                                  </Button>
                                ) : (
                                  <div className="text-center">
                                    Last withdrawal:
                                    <div>
                                      <a
                                        className="dark:text-pixel-blue underline"
                                        href={lastWithdrwalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`Link to last withdrawal transaction ${firstAndLast(
                                          lastWithdrwalHash
                                        )} on the block explorer`}
                                      >
                                        {firstAndLast(lastWithdrwalHash)}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: partnerTokens, isLoading } = usePartnerTokens(address || '');
  const totalBalanceUsd = partnerTokens ? calculateTotalBalanceUsd(partnerTokens) : 0;
  const lifetimeEarningsUsd = partnerTokens ? calculateLifetimeEarningsUsd(partnerTokens) : 0;

  return (
    <section className="mt-8 min-h-[50rem]">
      <h1 className="text-flashbang-white font-display mb-2 pb-0 text-center text-2xl sm:text-3xl">
        Dashboard
      </h1>
      {isConnected ? (
        <>
          <dl className="mx-auto grid grid-cols-2 gap-px bg-gray-900/5 place-items-center max-w-md">
            <div className="flex flex-wrap place-items-center text-center gap-x-4 gap-y-2 bg-white px-4 py-5 sm:px-6 xl:px-8">
              <dt className="text-sm font-medium text-gray-500 text-center w-full">
                Lifetime Earnings
              </dt>
              <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900 justify-center">
                {isLoading ? (
                  <div>
                    <Skeleton className="h-10" />
                  </div>
                ) : (
                  <div>{lifetimeEarningsUsd} USD</div>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap place-items-center text-center gap-x-4 gap-y-2 bg-white px-4 py-5 sm:px-6 xl:px-8">
              <dt className="text-sm font-medium text-gray-500 text-center w-full">
                Withdrawable Amount
              </dt>
              <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900 justify-center">
                {isLoading ? (
                  <div>
                    <Skeleton className="h-10" />
                  </div>
                ) : (
                  <div>{totalBalanceUsd} USD</div>
                )}
              </dd>
            </div>
          </dl>
          {partnerTokens && <PartnerTokensTable partnerTokens={partnerTokens} />}
        </>
      ) : (
        <div className="mt-12 flex justify-center">
          <ConnectWallet />
        </div>
      )}
    </section>
  );
};

export { Dashboard };
