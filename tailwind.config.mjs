/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Mare palette 2026-09-14 : #49363c main + #cdfdff highlight + accents */
        night: '#49363c',
        'night-deep': '#3a2b30',
        wine: '#49363c',
        'wine-deep': '#3a2b30',
        'wine-glow': '#5a4148',
        ink: '#ffffff',
        'ink-soft': '#cdfdff',
        'ink-faint': '#a8b8c5',
        'ink-mute': '#6f525c',
        gold: '#cdfdff',
        'gold-bright': '#cdfdff',
        rose: '#d18ea9',
        'rose-deep': '#7d94a7',
        /* Nouveaux tokens directs (à utiliser en priorité pour les nouveaux composants) */
        ice: '#cdfdff',
        slate: '#7d94a7',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      transitionTimingFunction: {
        awc: 'cubic-bezier(.2,.7,.3,1)',
      },
      maxWidth: {
        prose: '680px',
      },
    },
  },
  plugins: [],
};
