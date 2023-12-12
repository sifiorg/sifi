import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import GRAPH_URLS from 'src/subgraph.json';

const PARTNER_TOKENS_QUERY = gql`
  query GetPartnerTokens($id: ID!) {
    partner(id: $id) {
      id
      tokens {
        id
        balance
        balanceDecimal
        balanceUsd
        modifiedAt
        modifiedAtBlock
        modifiedAtTransaction
        token {
          address
        }
        withdrawn
        withdrawnDecimal
        withdrawnUsd
      }
    }
  }
`;

type TokenOfPartner = {
  id: string;
  balance: string;
  balanceDecimal: string;
  balanceUsd: string;
  modifiedAt: string;
  modifiedAtBlock: string;
  modifiedAtTransaction: string;
  token: {
    address: string;
  };
  withdrawn: string;
  withdrawnDecimal: string;
  withdrawnUsd: string;
};

type PartnerTokensResponse = {
  partner: {
    id: string;
    tokens: Array<TokenOfPartner>;
  };
};

type PartnerTokensByChain = Record<string, PartnerTokensResponse | null>;

const FIFTEEN_SECONDS = 1000 * 15;
const FIVE_MINUTES = 1000 * 60 * 5;

const usePartnerTokens = (address: string) => {
  const fetchPartnerTokens = async () => {
    const responses = await Promise.all(
      Object.entries(GRAPH_URLS).map(([chainId, url]) =>
        request(url, PARTNER_TOKENS_QUERY, { id: address.toLocaleLowerCase() })
          .then<PartnerTokensResponse>()
          .catch((error: any) => {
            console.error(`Failed to fetch data for ${chainId}:`, error);

            return null;
          })
      )
    );

    const result: Record<string, PartnerTokensResponse | null> = {};
    Object.keys(GRAPH_URLS).forEach((chainId, index) => {
      result[chainId] = responses[index];
    });

    return result;
  };

  return useQuery({
    queryKey: ['partnerTokensByChain', address],
    queryFn: fetchPartnerTokens,
    staleTime: FIVE_MINUTES,
    refetchInterval: FIFTEEN_SECONDS,
    refetchOnWindowFocus: false,
  });
};

export { usePartnerTokens };
export type { PartnerTokensByChain, TokenOfPartner };
