/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Simplified font stack
      },
      // Optional: Define specific dark mode colors if needed beyond Tailwind defaults
      // colors: {
      //   gray: {
      //     ...colors.gray, // Keep default grays
      //     800: '#1F2937', // Example dark background
      //     900: '#111827', // Example darker background
      //   }
      // }
    },
  },
  plugins: [
     require('@tailwindcss/line-clamp'),
     require('@tailwindcss/forms'),
  ],
};