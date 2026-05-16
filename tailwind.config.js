/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'game-bg': '#0f172a',
        'game-card': '#1e293b',
        'game-text': '#f8fafc',
        'game-muted': '#94a3b8',
        'game-correct': '#22c55e',
        'game-partial': '#f97316',
        'game-incorrect': '#64748b',
        'game-border': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        cell: '6px',
        card: '12px',
      },
    },
  },
  plugins: [],
};
