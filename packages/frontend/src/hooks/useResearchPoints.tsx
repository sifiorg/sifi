import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

const fetchPoints = async (address: `0x${string}`) => {
  const response = await fetch(`https://api.sifi.org/v1/points/${address}`);
  const data = await response.json();

  return data.total;
};

const useResearchPoints = () => {
  const { address } = useAccount();
  return useQuery(['researchPoints', address], () => {
    if (address) {
      return fetchPoints(address);
    } else {
      throw new Error('Address is undefined');
    }
  });
};

export { useResearchPoints };
