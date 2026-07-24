/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
        display: ["'Syne'", 'sans-serif'],
      },
      colors: {
        ink: '#06080d',
        fog: '#e8ecf4',
        muted: '#8792a8',
      },
    },
  },
  plugins: [],
};
