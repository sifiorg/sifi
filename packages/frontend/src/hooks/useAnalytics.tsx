import { createContext, FunctionComponent, ReactNode, useContext } from 'react';
import isChromatic from 'chromatic';
import { isStorybookDev, isTest } from '../utils';

const analyticsMethods = {
  logEvent: (goalId: string) => {
    const { fathom } = window;
    if (isTest || isStorybookDev || isChromatic() || !fathom) return;

    fathom.trackGoal(goalId, 0);
  },
  logPageView: (opts?: { url?: string; referrer?: string }) => {
    const { fathom } = window;
    if (isTest || isStorybookDev || isChromatic() || !fathom) return;

    fathom.trackPageview(opts ?? {});
  },
};

const AnalyticsContext = createContext(analyticsMethods);

const AnalyticsProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  if (!window.fathom) {
    return <>{children}</>;
  }

  return <AnalyticsContext.Provider value={analyticsMethods}>{children}</AnalyticsContext.Provider>;
};

const useAnalytics = () => useContext(AnalyticsContext);

export default useAnalytics;
export { AnalyticsProvider };
