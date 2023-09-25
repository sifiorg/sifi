import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { searchParams } from 'src/utils/routes';
import { isAddress } from 'viem';

const useReferrer = () => {
  const [searchParamsFromUrl] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const refParam = searchParamsFromUrl.get(searchParams.REFERRER);

    if (!refParam) return;

    const referrerAddress = refParam.slice(0, 42);

    if (!isAddress(referrerAddress)) {
      console.error('Invalid Referrer Address. Address should be 42 characters');

      return;
    }

    const referrerFeeBps = refParam.slice(42);
    const formattedReferrerFeeBps =
      referrerFeeBps && Number(referrerFeeBps) > 0 ? referrerFeeBps : null;

    localStorage.setItem(localStorageKeys.REFFERRER_ADDRESS, referrerAddress);

    if (formattedReferrerFeeBps) {
      localStorage.setItem(localStorageKeys.REFERRER_FEE_BPS, formattedReferrerFeeBps);
    } else {
      // In case there is a new referral address without a set fee bps, we remove the old one
      localStorage.removeItem(localStorageKeys.REFERRER_FEE_BPS);
    }

    navigate('/');
  }, [searchParamsFromUrl]);
};

export { useReferrer };
