/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pickle: {
          50:  '#f0f9f4',
          100: '#dcf1e6',
          200: '#bbe3cf',
          300: '#8acdb0',
          400: '#55b088',
          500: '#2d7d4f',
          600: '#236040',
          700: '#1d4f35',
          800: '#183f2a',
          900: '#0f2b1c',
        },
        ball: {
          light: '#fde68a',
          DEFAULT: '#f5c518',
          dark:  '#d4a017',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
