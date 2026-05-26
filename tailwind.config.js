/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Verdana', 'Geneva', 'sans-serif'],
        heading: ['"Century Gothic"', '"Trebuchet MS"', '"Gill Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
