const getEvmTxUrl = (network: string, txid: string): string | undefined => {
  switch (network) {
    case 'ethereum':
      return `https://etherscan.io/tx/${txid}`;
    case 'avax':
      return `https://snowtrace.io/tx/${txid}`;
    case 'bsc':
      return `https://bscscan.com/tx/${txid}`;
    case 'polygon':
      return `https://polygonscan.com/tx/${txid}`;
    case 'etc':
      return `http://gastracker.io/tx/${txid}`;
    case 'fantom':
      return `https://ftmscan.com/tx/${txid}`;
    case 'arbitrum':
      return `https://arbiscan.io/tx/${txid}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/tx/${txid}`;
    case 'smartbch':
      return `https://smartscan.cash/transaction/${txid}`;
    case 'cronos':
      return `https://cronoscan.com/tx/${txid}`;
    case 'arbitrumnova':
      return `https://nova.arbiscan.io/tx/${txid}`;
    case 'zksyncera':
      return `https://explorer.zksync.io/tx/${txid}`;
    default:
      return undefined;
  }
};

export { getEvmTxUrl };
