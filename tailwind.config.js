/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/qwik-theme-toggle/**/*.{cjs,mjs}",
    "./node_modules/qwik-toasts/**/*.{cjs,mjs}",
  ],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#008195",
          "primary-focus": "#00515c",
          "primary-content": "#e5fcff",

          secondary: "#0fceeb",
          "secondary-focus": "#0db3c9",
          "secondary-content": "#012638",

          accent: "#FB6793",
          "accent-focus": "#723145",
          "accent-content": "#fff5f8",

          neutral: "#3b424e",
          "neutral-focus": "#2a2e37",
          "neutral-content": "#ffffff",

          "base-100": "#e5fcff",
          "base-200": "#cce6ea",
          "base-300": "#396479",
          "base-content": "#012638",

          info: "#1c92f2",
          success: "#009485",
          warning: "#ff9900",
          error: "#ff5724",

          "--rounded-box": "1rem",
          "--rounded-btn": ".5rem",
          "--rounded-badge": "1.9rem",

          "--animation-btn": ".25s",
          "--animation-input": ".2s",

          "--btn-text-case": "normalcase",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px",
        },
        dark: {
          primary: "#00515c",
          "primary-focus": "#008195",
          "primary-content": "#e5fcff",

          secondary: "#026f7e",
          "secondary-focus": "#03AAC2",
          "secondary-content": "#e5fcff",

          accent: "#723145",
          "accent-focus": "#FB6793",
          "accent-content": "#ffffff",

          neutral: "#2a2e37",
          "neutral-focus": "#3b424e",
          "neutral-content": "#ffffff",

          "base-100": "#012638",
          "base-200": "#396479",
          "base-300": "#eaf5fb",
          "base-content": "#ffffff",

          info: "#1c92f2",
          success: "#009485",
          warning: "#ff9900",
          error: "#ff5724",

          "--rounded-box": "1rem",
          "--rounded-btn": ".5rem",
          "--rounded-badge": "1.9rem",

          "--animation-btn": ".25s",
          "--animation-input": ".2s",

          "--btn-text-case": "normalcase",
          "--navbar-padding": ".5rem",
          "--border-btn": "1px",
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        'custom': 'inset 0 0 0 2000px #e5fcffc1',
        'custom-dark': 'inset 0 0 0 2000px #012638c1',
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  extend: {
    boxShadow: ['dark']
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
