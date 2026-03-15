/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. ADD THE KEYFRAMES (This tells the light to start on the left and move right)
      keyframes: {
        glint: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      // 2. ADD THE ANIMATION (This controls the speed and makes it loop forever)
      animation: {
        glint: 'glint 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}