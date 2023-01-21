/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    fontFamily: {
      sans: ['var(--font-manrope)', 'sans-serif'],
    },
    extend: {
      colors: {
        'pfm-neutral-100': 'hsla(0, 0%, 10%, 1.0)',
        'pfm-neutral-200': 'hsla(0, 0%, 20%, 1.0)',
        'pfm-neutral-300': 'hsla(0, 0%, 30%, 1.0)',
        'pfm-neutral-400': 'hsla(0, 0%, 40%, 1.0)',
        'pfm-neutral-500': 'hsla(0, 0%, 50%, 1.0)',
        'pfm-neutral-600': 'hsla(0, 0%, 60%, 1.0)',
        'pfm-neutral-700': 'hsla(0, 0%, 70%, 1.0)',
        'pfm-neutral-800': 'hsla(0, 0%, 80%, 1.0)',
        'pfm-neutral-900': 'hsla(0, 0%, 90%, 1.0)',
        'pfm-purple-100': 'hsla(268, 22%, 10%, 1.0)',
        'pfm-purple-200': 'hsla(268, 22%, 20%, 1.0)',
        'pfm-purple-300': 'hsla(268, 22%, 30%, 1.0)',
        'pfm-purple-400': 'hsla(268, 22%, 40%, 1.0)',
        'pfm-purple-500': 'hsla(268, 22%, 50%, 1.0)',
        'pfm-purple-600': 'hsla(268, 22%, 60%, 1.0)',
        'pfm-purple-700': 'hsla(268, 22%, 70%, 1.0)',
        'pfm-purple-800': 'hsla(268, 22%, 80%, 1.0)',
        'pfm-purple-900': 'hsla(268, 22%, 90%, 1.0)',
        'pfm-orange-100': 'hsla(35, 100%, 10%, 1.0)',
        'pfm-orange-200': 'hsla(35, 100%, 20%, 1.0)',
        'pfm-orange-300': 'hsla(35, 100%, 30%, 1.0)',
        'pfm-orange-400': 'hsla(35, 100%, 40%, 1.0)',
        'pfm-orange-500': 'hsla(35, 100%, 50%, 1.0)',
        'pfm-orange-600': 'hsla(35, 100%, 60%, 1.0)',
        'pfm-orange-700': 'hsla(35, 100%, 70%, 1.0)',
        'pfm-orange-800': 'hsla(35, 100%, 80%, 1.0)',
        'pfm-orange-900': 'hsla(35, 100%, 90%, 1.0)',
        'pfm-teal-100': 'hsla(165, 93%, 10%, 1.0)',
        'pfm-teal-200': 'hsla(165, 93%, 20%, 1.0)',
        'pfm-teal-300': 'hsla(165, 93%, 30%, 1.0)',
        'pfm-teal-400': 'hsla(165, 93%, 40%, 1.0)',
        'pfm-teal-500': 'hsla(165, 93%, 50%, 1.0)',
        'pfm-teal-600': 'hsla(165, 93%, 60%, 1.0)',
        'pfm-teal-700': 'hsla(165, 93%, 70%, 1.0)',
        'pfm-teal-800': 'hsla(165, 93%, 80%, 1.0)',
        'pfm-teal-900': 'hsla(165, 93%, 90%, 1.0)',
      },
      dropShadow: {
        'glow-white': '0 0 10px hsla(0, 0%, 100%, 0.75)',
        'glow-orange': '0 0 10px hsla(35, 100%, 80%, 0.75)',
      },
      boxShadow: {
        'glow-white': '0 0 30px hsla(0, 0%, 100%, 0.25)',
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'fade-out': 'fadeout 8s both',
        'lightning-draw-1': '0.75s linear 0s 2 both lightning-draw-1',
        'lightning-draw-2': '0.75s linear 0.25s 2 both lightning-draw-2',
        'boost-glow-shudder':
          '0.175s ease 0s 10 both shudder, 10s ease 0s 1 both boost-glow',
      },
      keyframes: {
        fadeout: {
          '0%, 75%': { opacity: 1.0 },
          '100%': { opacity: 0.0 },
        },
        'lightning-draw-1': {
          '0%': {
            'stroke-dashoffset': 800,
          },
          '100%': {
            'stroke-dashoffset': -1500,
          },
        },
        'lightning-draw-2': {
          '0%': {
            'stroke-dashoffset': 800,
          },
          '100%': {
            'stroke-dashoffset': -1850,
          },
        },
        shudder: {
          '0%, 100%': {
            transform: 'rotateZ(0deg)',
          },
          '25%': {
            transform: 'rotateZ(0.5deg)',
          },
          '75%': {
            transform: 'rotateZ(-0.5deg)',
          },
        },
        'boost-glow': {
          '0%': {
            boxShadow: '0 0 30px hsla(0, 0%, 100%, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 30px hsla(0, 0%, 100%, 0.0)',
          },
        },
      },
    },
  },
  plugins: [],
};
