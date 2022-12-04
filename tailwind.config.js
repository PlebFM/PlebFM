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
        'pfm-purple-100': 'hsla(268, 22%, 10%, 1.0)',
        'pfm-purple-200': 'hsla(268, 22%, 20%, 1.0)',
        'pfm-purple-300': 'hsla(268, 22%, 30%, 1.0)',
        'pfm-purple-400': 'hsla(268, 22%, 40%, 1.0)',
        'pfm-purple-500': 'hsla(268, 22%, 50%, 1.0)',
        'pfm-purple-600': 'hsla(268, 22%, 60%, 1.0)',
        'pfm-purple-700': 'hsla(268, 22%, 70%, 1.0)',
        'pfm-purple-800': 'hsla(268, 22%, 80%, 1.0)',
        'pfm-purple-900': 'hsla(268, 22%, 90%, 1.0)',
      }
    },
  },
  plugins: [],
}
