/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'court-dark':     '#1c1917',
        'court-mid':      '#292524',
        'court-surface':  '#3a3431',
        'court-line':     '#44403c',
        'shuttle-white':  '#fafaf9',
        'shuttle-feather':'#a8a29e',
        'ace-green':      '#6aaa64',
        'racket-orange':  '#f97316',
        'miss-grey':      '#78716c',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        cell: '6px',
        card: '10px',
      },
      keyframes: {
        'flip': {
          '0%':   { transform: 'rotateX(0deg)' },
          '50%':  { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        'celebrate': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(106, 170, 100, 0)' },
          '25%':      { transform: 'scale(1.05) rotate(-2deg)', boxShadow: '0 0 22px 6px rgba(106, 170, 100, 0.55)' },
          '50%':      { transform: 'scale(1.08) rotate(2deg)',  boxShadow: '0 0 30px 10px rgba(106, 170, 100, 0.7)' },
          '75%':      { transform: 'scale(1.05) rotate(-1deg)', boxShadow: '0 0 22px 6px rgba(106, 170, 100, 0.55)' },
        },
        'pop-in': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'flip':         'flip 0.5s ease forwards',
        'celebrate':    'celebrate 1.2s ease-in-out 2',
        'pop-in':       'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'confetti':     'confetti-fall 2.5s ease-in forwards',
      },
    },
  },
  plugins: [],
};
