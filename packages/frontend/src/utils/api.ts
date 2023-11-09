const baseUrl =
  import.meta.env.REACT_APP_BACKEND_OVERRIDE === 'localhost'
    ? 'http://localhost:3100/v1/'
    : 'https://api.sifi.org/v1/';

export { baseUrl };
