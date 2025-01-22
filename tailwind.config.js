const { fontFamily } = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ds-bg': '#0F2F2F',
        'ds-accent': '#18BFBF',
        'ds-text': '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        pixel: ["var(--font-pixel)", "monospace"],
      },
      backgroundImage: {
        'ds-grid': 'linear-gradient(rgba(24,191,191,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(24,191,191,0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '16px 16px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

