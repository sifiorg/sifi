const defaultTheme = require('@sifi/shared-ui/dist/tailwindTheme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../node_modules/@sifi/shared-ui/**/*.js',
  ],
  theme: defaultTheme,
  plugins: [require('@tailwindcss/forms')],
};
