const apiUrl =
  window.location.href.includes('localhost') && !window.location.href.includes('ipfs')
    ? 'http://localhost:3100'
    : 'https://api.sideshift.fi';

export { apiUrl };
