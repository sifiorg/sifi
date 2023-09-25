const baseUrl = import.meta.env.REACT_APP_BACKEND_OVERRIDE === 'localhost' ? 'http://localhost:3100/v1/' : 'https://api.sideshift.fi/v1/';

export { baseUrl };
