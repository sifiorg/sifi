const parseErrorMessage = (message: string) => {
  if (message.includes('user rejected transaction')) {
    return 'You rejected the transaction';
  }

  return message;
};

export { parseErrorMessage };
