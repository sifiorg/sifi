const firstAndLast = (value: string, first = 4, last = 4, middle = '...') => {
  if (value.length <= first + last) {
    return value;
  }

  const beginning = value.substring(0, first);
  const end = value.substring(value.length - last);

  return `${beginning}${middle}${end}`;
};

export { firstAndLast };
