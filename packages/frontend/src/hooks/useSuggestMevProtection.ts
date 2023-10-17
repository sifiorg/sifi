import { useEffect } from "react";
import { showToast } from "@sifi/shared-ui";
import { useWalletClient } from "wagmi";
import { mainnet } from 'viem/chains';
import { localStorageKeys } from "src/utils/localStorageKeys";

const MEVBlockerRPCUrl = 'https://mevblocker.io/#rpc';

// NOTE: No consistent way to detect if user is already uising MEVBlocker
const useSuggestMevProtection = () => {
  const { data: walletClient } = useWalletClient();

  const updateRpcUrl = () => {
    window.open(MEVBlockerRPCUrl, '_blank');
    localStorage.setItem(localStorageKeys.HAS_SUGGESTED_PROTECTED_RPC, 'true');
  };

  const suggestProtectedRPC = () => {
    showToast({
      type: 'info',
      text: 'We suggest you use MEV protection to avoid sandwich attacks.',
      action: { text: 'Add protected RPC', onClick: updateRpcUrl },
    });
  };

  useEffect(() => {
    if (!walletClient || walletClient.chain.id !== mainnet.id) return;

    const hasSuggestedProtectedRPC = localStorage.getItem(localStorageKeys.HAS_SUGGESTED_PROTECTED_RPC);
    if (!hasSuggestedProtectedRPC) {
      suggestProtectedRPC();
    }
  }, [walletClient?.chain])
};

export { useSuggestMevProtection };
