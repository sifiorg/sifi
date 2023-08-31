const isValidTokenAmount = (value?: string): boolean => {
  return Boolean(value) && value !== '0' && Boolean(Number(value));
};

export { isValidTokenAmount };
