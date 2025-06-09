// postcss.config.cjs
module.exports = {
  plugins: {
    autoprefixer: {},
    // IMPORTANT: You typically DO NOT need 'tailwindcss' here if you are using
    // '@tailwindcss/vite' plugin in your vite.config.js for Tailwind CSS v4+.
    // The @tailwindcss/vite plugin handles Tailwind's PostCSS integration.
  },
};
