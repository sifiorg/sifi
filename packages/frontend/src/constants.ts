const ETH_CONTRACT_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const ETH_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MIN_ALLOWANCE = '0xffffffffffffffffffffffffffffff';
const MAX_ALLOWANCE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const POPULAR_TOKEN_SYMBOLS = ['ETH', 'USDT', 'XAI', 'USDC', 'WBTC', 'BUSD', 'DAI'];

// Standard ERC20 ABI for `balanceOf` function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
    stateMutability: 'view',
  },
] as const;

// Based on various interactions with the Sifi Smart Contract
const SWAP_MAX_GAS_UNITS = 150000;

const SIFI_CONTRACT_ADDRESS = '0x65c49E9996A877d062085B71E1460fFBe3C4c5Aa';

const STAR_VAULT_ABI = [
  { inputs: [], name: 'EthTransferFailed', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'available', type: 'uint256' }],
    name: 'InsufficientOwnerBalance',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'partner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PartnerWithdraw',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'address payable', name: 'to', type: 'address' },
    ],
    name: 'ownerWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'partner', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'partnerTokenBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'partner', type: 'address' }],
    name: 'partnerTokens',
    outputs: [{ internalType: 'address[]', name: 'tokens_', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'partnerWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export {
  ETH_CONTRACT_ADDRESS,
  ETH_ZERO_ADDRESS,
  MIN_ALLOWANCE,
  MAX_ALLOWANCE,
  POPULAR_TOKEN_SYMBOLS,
  SWAP_MAX_GAS_UNITS,
  ERC20_ABI,
  SIFI_CONTRACT_ADDRESS,
  STAR_VAULT_ABI,
};
