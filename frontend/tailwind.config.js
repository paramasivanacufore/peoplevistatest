/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'people-blue': '#011748',
      },
      fontFamily: {
        // Your custom font stack
        custom: [
          "'Segoe UI'",
        ],
        // Default sans if needed
        sans: ['Segoe UI'],
      },
    },
  },
  plugins: [],
};
