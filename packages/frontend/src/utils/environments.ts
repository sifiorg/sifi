const isTest = window.origin.includes('localhost');

const isStorybookDev = import.meta.env.STORYBOOK_DEV === 'true';

export { isStorybookDev, isTest };
