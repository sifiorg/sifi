import type { Token } from "@sifi/sdk";

type MulticallToken = Omit<Token, 'address'> & { address: `0x${string}` };
type BalanceMap = Map<`0x${string}`, bigint>;

export type { MulticallToken, BalanceMap };
