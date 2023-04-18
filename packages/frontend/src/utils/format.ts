import Big from 'big.js';

// JavaScript numbers use exponential notation for positive exponents of 21 and above. We need more.
Big.PE = 42;
// JavaScript numbers use exponential notation for negative exponents of -7 and below. We need more.
Big.NE = -42;

/**
 * Format token amount to at least 4 decimals.
 * @param amount amount to format.
 * @returns formatted amount.
 */
export const formatTokenAmount = (amount = '0', decimals = 0) => {
  let shiftedAmount = amount;
  if (decimals) {
    shiftedAmount = (Number(amount) / 10 ** decimals).toString();
  }
  const parsedAmount = parseFloat(shiftedAmount);
  if (parsedAmount === 0 || Number.isNaN(Number(shiftedAmount))) {
    return '0';
  }

  let decimalPlaces = 3;
  const absAmount = Math.abs(parsedAmount);
  while (absAmount < 1 / 10 ** decimalPlaces) {
    decimalPlaces += 1;
  }

  return Big(parseFloat(Big(parsedAmount).toFixed(decimalPlaces + 1, 0))).toString();
};

// This was copied from LiFI
export const formatAmount = (amount = '', returnInitial = false) => {
  if (!amount) {
    return amount;
  }
  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(Number(amount)) && !Number.isNaN(parsedAmount)) {
    return parsedAmount.toString();
  }
  if (Number.isNaN(parsedAmount)) {
    return '';
  }
  if (parsedAmount < 0) {
    return Math.abs(parsedAmount).toString();
  }
  try {
    if (returnInitial && Big(amount)) {
      return amount;
    }
  } catch {
    return '';
  }

  return Big(parsedAmount).toString();
};

export const formatAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;

export const formatEnsName = (name: string) => {
  return name.length > 11 ? `${name.slice(0, 11)}...` : name;
};
