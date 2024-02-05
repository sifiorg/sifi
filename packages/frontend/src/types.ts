import type { BaseError } from 'viem';

type BalanceMap = Map<`0x${string}`, { balance: string; usdValue?: string | null }>;

type ViemError = Error | (Error & BaseError);

export type { BalanceMap, ViemError };
