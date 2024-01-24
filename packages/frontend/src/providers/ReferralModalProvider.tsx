import { createContext, useState, useContext } from 'react';

interface ReferralModalContextProps {
  isReferralModalOpen: boolean;
  openReferralModal: () => void;
  closeReferralModal: () => void;
}

const ReferralModalContext = createContext<ReferralModalContextProps>({
  isReferralModalOpen: false,
  openReferralModal: () => {},
  closeReferralModal: () => {},
});

export const ReferralModalProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const openReferralModal = () => setIsReferralModalOpen(true);
  const closeReferralModal = () => setIsReferralModalOpen(false);

  return (
    <ReferralModalContext.Provider
      value={{ isReferralModalOpen, openReferralModal, closeReferralModal }}
    >
      {children}
    </ReferralModalContext.Provider>
  );
};

export const useReferralModal = () => useContext(ReferralModalContext);
