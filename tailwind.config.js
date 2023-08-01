/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },

      animation: {
        "slide-in-right": "slide_in_right 0.5s",
        "slide-out-right": "slide_out_right 0.5s",
      },
      keyframes: {
        slide_in_right: {
          "0%": {
            transform: "translate3d(110%, 0, 0);",
            visibility: "visible",
          },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
        slide_out_right: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": {
            transform: "translate3d(110%, 0, 0);",
            visibility: "hidden",
          },
        },
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
    // require("daisyui")
  ],
};
