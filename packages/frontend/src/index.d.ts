interface Window extends Window {
  fathom?: {
    trackPageview: (opts?: { url?: string; referrer?: string }) => void;
    trackGoal: (code: string, cents: number) => void;
  };
}
