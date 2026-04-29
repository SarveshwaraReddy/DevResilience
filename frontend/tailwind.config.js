/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22D3EE",
        secondary: "#A855F7",
        tertiary: "#FFFFFF",
        neutral: "#050816",
        background: "#0B0E14",
        surface: "#141721",
        "surface-hover": "#1A1D27",
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

