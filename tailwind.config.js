/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      primary: {
        DEFAULT: "#f0fdfa",
        light: "#f0fdfa",
        100: "#ccfbf1",
        200: "#99f6e4",
        300: "#5eead4",
        400: "#2dd4bf",
        500: "#14b8a6",
        600: "#0d9488",
        700: "#0f766e",
        800: "#115e59",
        900: "#134e4a",
        dark: "#042f2e",
      },
    },
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        rotate45: "rotate45 0.5s ease-out",
        "slide-in-right": "slide_in_right 0.5s",
        "slide-out-right": "slide_out_right 0.5s",
        "progress-slide": "progress_slide var(--bar-duration) linear",
      },
      keyframes: {
        rotate45: {
          "0%": { opacity: 0.1, transform: "rotate(45deg)" },
          "100%": { opacity: 1, transform: "rotate(0deg)" },
        },
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
        progress_slide: {
          from: { width: "0%" },
          to: { width: "100%" },
        },
      },
    },
  },
  plugins: [
    require("flowbite/plugin"),
  ],
};
