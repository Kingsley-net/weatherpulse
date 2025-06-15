// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // If you had any custom colors, fonts, or other extensions here, they would be included.
      // Assuming a 'custom-bg' class implies a background image or specific gradient not defined in theme.
      // If 'custom-bg' was just a placeholder, you'd have a default background here or in global CSS.
    },
  },
  plugins: [], // This was likely empty or contained only default Tailwind plugins
};
