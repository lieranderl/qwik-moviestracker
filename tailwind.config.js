/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')


module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif']
      },
    },
  },
  plugins: [],
};
