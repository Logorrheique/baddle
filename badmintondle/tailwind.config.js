/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'game-bg':        '#071209',
        'game-card':      '#0f1c0d',
        'game-border':    '#1d3a1a',
        'game-text':      '#edfce8',
        'game-muted':     '#4d7a49',
        'game-correct':   '#22c55e',
        'game-partial':   '#f59e0b',
        'game-incorrect': '#1f351c',
        'game-accent':    '#4ade80',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        cell: '5px',
        card: '10px',
      },
      animation: {
        'cell-in': 'cellIn 180ms ease-out both',
        'row-in':  'rowIn 280ms ease-out both',
      },
      keyframes: {
        cellIn: {
          '0%':   { transform: 'scaleY(0.75)', opacity: '0' },
          '100%': { transform: 'scaleY(1)',    opacity: '1' },
        },
        rowIn: {
          '0%':   { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
