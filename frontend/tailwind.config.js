/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBg: '#F4F6F5', // soft cool mist
        brandSurface: '#FFFFFF', // Surface/cards
        brandNavy: '#16233C', // Primary ink/text
        brandMuted: '#5C6B7A', // Muted text
        brandAccent: '#4C3BCF', // Accent (buttons, links, brand)
        brandAccentSoft: '#ECEAFB', // Accent soft (tag backgrounds)
        brandAvailable: '#2F9E62', // Semantic - Available
        brandBooked: '#C4483D', // Semantic - Booked
        brandUnavailable: '#C7C9C4', // Semantic - Unavailable
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
