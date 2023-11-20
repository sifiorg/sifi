import { FC, useEffect, useState } from 'react';
import { Skeleton, Table, formatTokenAmount } from '@sifi/shared-ui';
import { Token } from '@sifi/sdk';
import { Button } from 'src/components/Button';
import { PartnerTokensByChain, TokenOfPartner } from 'src/hooks/usePartnerTokens';
import { getChainById, getChainIcon } from 'src/utils/chains';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useFetchTokens } from 'src/hooks/useFetchTokens';
import { usePartnerWithdraw } from 'src/hooks/usePartnerWithdraw';
import { ConnectWallet } from 'src/components/ConnectWallet/ConnectWallet';
import { firstAndLast, getEvmTxUrl } from 'src/utils';
import { ETH_CONTRACT_ADDRESS, ETH_ZERO_ADDRESS } from 'src/constants';
import { usePartnerData } from 'src/hooks/usePartnerData';

type PartnerTokensTableProps = {
  partnerTokensByChain: PartnerTokensByChain;
};

type TokenRowProps = {
  token: TokenOfPartner;
  chainId: string;
  handleWithdraw: (tokenAddress: string, chainId: number) => void;
  withdrawnTokens: { [key: string]: string };
  tokensByChainIdAndAddress: Record<string, Token>;
};

const TokenRow: FC<TokenRowProps> = ({
  token,
  chainId,
  handleWithdraw,
  withdrawnTokens,
  tokensByChainIdAndAddress,
}) => {
  const tokenAddress = token.token.address;
  let normalizedTokenAddress = tokenAddress;
  if (normalizedTokenAddress === ETH_ZERO_ADDRESS) {
    normalizedTokenAddress = ETH_CONTRACT_ADDRESS.toLowerCase();
  }

  const tokenKey = `${chainId}-${normalizedTokenAddress}`;
  const tokenDetails = tokensByChainIdAndAddress[tokenKey];
  const showWithdrawalButton = Number(token.balanceDecimal) > 0 && !withdrawnTokens[tokenAddress];
  const lastWithdrwalHash = withdrawnTokens[token.id] || token.modifiedAtTransaction;
  const lastWithdrawalUrl = getEvmTxUrl(
    getChainById(Number(chainId)),
    withdrawnTokens[token.id] || token.modifiedAtTransaction
  );
  const hasBalance = Number(token.balanceDecimal) > 0;

  return (
    <Table.Row className="overflow-y-auto max-w-xs m-auto sm:max-w-none my-2" key={token.id}>
      <Table.Cell className="mb-2 w-full sm:mb-0">
        <div className="mx-auto grid items-center sm:grid-cols-2">
          <div className="mb-4 sm:mb-0 sm:inline-block sm:pl-8">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="relative mr-3 ">
                <img className="h-12 w-12 rounded-full" src={tokenDetails?.logoURI} alt="Logo" />
                <img
                  src={getChainIcon(tokenDetails?.chainId)}
                  className="w-6 h-6 -right-1 -bottom-1 absolute"
                />
              </div>
              <div className="flex flex-col pl-4">
                <span>{`${formatTokenAmount(token.balanceDecimal)} ${tokenDetails?.symbol}`}</span>
                <span className="text-sm">
                  {hasBalance && `≈ ${formatTokenAmount(token.balanceUsd)} USD`}
                </span>
              </div>
            </div>
          </div>
          <Table.Cell className="flex place-items-center align-middle justify-center my-2 sm:m-auto">
            {showWithdrawalButton ? (
              <Button
                role="button"
                size="small"
                onClick={() => handleWithdraw(tokenAddress, Number(chainId))}
              >
                Withdraw
              </Button>
            ) : (
              <div className="text-center">
                Last withdrawal:
                <div>
                  <a
                    className="dark:text-pixel-blue underline"
                    href={lastWithdrawalUrl}
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
          </Table.Cell>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

const PartnerTokensTable: FC<PartnerTokensTableProps> = ({ partnerTokensByChain }) => {
  const { chain: activeChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const chainIds = Object.keys(partnerTokensByChain).map(Number);
  const { fetchTokens, tokensByChainIdAndAddress } = useFetchTokens(chainIds);
  const [withdrawnTokens, setWithdrawnTokens] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTokens();
  }, []);

  const partnerWithdrawMutation = usePartnerWithdraw();

  const handleWithdraw = async (tokenAddress: string, chainId: number) => {
    if (switchNetwork && chainId !== activeChain?.id) {
      switchNetwork(chainId);
    }

    partnerWithdrawMutation.mutate(
      { tokenAddress, chainId },
      {
        onSuccess: async receipt => {
          if (receipt) {
            setWithdrawnTokens(prev => ({ ...prev, [tokenAddress]: receipt }));
          }
        },
      }
    );
  };

  return (
    <section>
      <div className="mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center justify-between gap-2">
          <div className=" w-full mt-4">
            <Table>
              <Table.Body>
                {Object.entries(partnerTokensByChain).map(
                  ([chainId, data]) =>
                    data?.partner?.tokens?.map(token => (
                      <TokenRow
                        key={token.id}
                        token={token}
                        chainId={chainId}
                        handleWithdraw={handleWithdraw}
                        withdrawnTokens={withdrawnTokens}
                        tokensByChainIdAndAddress={tokensByChainIdAndAddress}
                      />
                    ))
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsCard = ({
  title,
  value,
  isLoading,
}: {
  title: string;
  value: number;
  isLoading: boolean;
}) => (
  <div className="flex flex-wrap place-items-center text-center gap-x-4 gap-y-2 bg-white px-4 py-5 sm:px-6 xl:px-8">
    <dt className="text-sm font-medium text-gray-500 text-center w-full">{title}</dt>
    <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900 justify-center">
      {isLoading ? (
        <div>
          <Skeleton className="h-10" />
        </div>
      ) : (
        <div>{value} USD</div>
      )}
    </dd>
  </div>
);

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { partnerTokensByChain, totalBalanceUsd, lifetimeEarningsUsd, isLoading } = usePartnerData(
    address || ''
  );

  return (
    <section className="mt-8 min-h-[50rem]">
      <h1 className="text-flashbang-white font-display mb-2 pb-0 text-center text-2xl sm:text-3xl">
        Dashboard
      </h1>
      {isConnected ? (
        <>
          <dl className="mx-auto grid grid-cols-2 gap-px bg-gray-900/5 place-items-center max-w-md">
            <StatsCard
              title="Lifetime Earnings"
              value={lifetimeEarningsUsd}
              isLoading={isLoading}
            />
            <StatsCard title="Withdrawable Amount" value={totalBalanceUsd} isLoading={isLoading} />
          </dl>
          {partnerTokensByChain && (
            <PartnerTokensTable partnerTokensByChain={partnerTokensByChain} />
          )}
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
