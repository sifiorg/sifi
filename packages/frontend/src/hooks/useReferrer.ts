import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { isAddress } from 'viem';

const useReferrer = () => {
  const { ref: refParam, fromToken, toToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!refParam) return;

    const existingReferrer = localStorage.getItem(localStorageKeys.REFFERRER_ADDRESS);

    if (existingReferrer) return;

    const [referrerAddress, referrerFeeBps] = refParam.split(':');

    if (!isAddress(referrerAddress)) {
      console.error('Invalid Referrer Address. Address should be 42 characters');

      return;
    }

    const formattedReferrerFeeBps =
      referrerFeeBps && Number(referrerFeeBps) > 0 ? referrerFeeBps : null;

    localStorage.setItem(localStorageKeys.REFFERRER_ADDRESS, referrerAddress);

    if (formattedReferrerFeeBps) {
      localStorage.setItem(localStorageKeys.REFERRER_FEE_BPS, formattedReferrerFeeBps);
    } else {
      localStorage.removeItem(localStorageKeys.REFERRER_FEE_BPS);
    }

    // Navigate to the new URL without the referral part
    if (fromToken && toToken) {
      navigate(`/${fromToken}/${toToken}`);
    } else {
      navigate('/');
    }
  }, [refParam, fromToken, toToken, navigate]);
};

export { useReferrer };
