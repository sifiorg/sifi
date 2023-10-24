// From https://stackoverflow.com/a/2901298/521834
const numberWithCommas = (value: string | number): string => {
  const parts = value.toString().split('.');
  return parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? `.${parts[1]}` : '');
};

export { numberWithCommas };
