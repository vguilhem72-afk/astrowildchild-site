/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0F0818',
        'night-deep': '#07060A',
        wine: '#2A0D1C',
        'wine-deep': '#1A0A12',
        'wine-glow': '#320F22',
        ink: '#F5F0EA',
        'ink-soft': '#E8D5A3',
        'ink-faint': '#8B7A6E',
        'ink-mute': '#5A4A54',
        gold: '#C9A96E',
        'gold-bright': '#E8D5A3',
        rose: '#C47E8A',
        'rose-deep': '#8B5A78',
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
