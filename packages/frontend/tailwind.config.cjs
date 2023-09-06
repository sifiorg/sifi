const defaultTheme = require('@sifi/shared-ui/dist/tailwindTheme');

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@sifi/**/*.js',
    '../../node_modules/@sifi/**/*.js',
  ],
  theme: defaultTheme,
  plugins: [require('@tailwindcss/forms')],
};
