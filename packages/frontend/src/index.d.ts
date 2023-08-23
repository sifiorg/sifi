interface Window extends Window {
  fathom?: {
    trackPageview: (opts?: { url?: string; referrer?: string }) => void;
    trackGoal: (code: string, cents: number) => void;
  };
}

declare module '*.svg' {
  const src: string;
  const ReactComponent: FunctionComponent<HTMLAttributes<HTMLOrSvgElement>>;
  export { ReactComponent };
  export default src;
}
