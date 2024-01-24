const { REACT_APP_WALLET_CONNECT_PROJECT_ID, REACT_APP_DEFAULT_FEE_BPS } = import.meta.env;

const walletConnectProjectId = REACT_APP_WALLET_CONNECT_PROJECT_ID;
const defaultFeeBps = REACT_APP_DEFAULT_FEE_BPS ? Number(REACT_APP_DEFAULT_FEE_BPS) : undefined;
const defaultReferralFeeBps = 40;

export { walletConnectProjectId, defaultFeeBps, defaultReferralFeeBps };
