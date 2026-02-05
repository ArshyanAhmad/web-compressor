/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-grey': '#f5f5f5',
        'dark-grey': '#2c2c2c',
        'blackish': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
