/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['var(--font-manrope)', 'sans-serif']
    },
    extend: {
      colors: {
        'pfm-purple-100': 'hsla(268, 22%, 10%, 1.0)'
      }
    },
  },
  plugins: [],
}
