const parseErrorMessage = (message: string) => {
  if (message.toLowerCase().includes('user rejected the request')) {
    return 'You rejected the transaction';
  }

  return message;
};

export { parseErrorMessage };
