// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Ensure 'custom-bg' is defined here if it's a Tailwind class for a background image.
      // If 'custom-bg' is defined in a global CSS file, you can remove this section.
      backgroundImage: {
        'custom-bg': "url('/path/to/your/background-image.jpg')", // REMEMBER TO REPLACE THIS PATH
      },
      // Define custom box-shadow for glass elements
      boxShadow: {
        'glass-inner': 'inset 0 4px 20px rgba(255, 255, 255, 0.3)', // Inner light reflection for depth
        'glass-outer': '0 8px 32px rgba(31, 38, 135, 0.2)', // Soft outer shadow for subtle lift
      },
      // Define custom keyframes for animations
      keyframes: {
        'liquid-shine': {
          '0%': { transform: 'scaleX(1.5) skewX(-20deg) translateX(-150%)' }, // Start far left, skewed
          '100%': { transform: 'scaleX(1.5) skewX(-20deg) translateX(150%)' }, // End far right, skewed
        },
        'cloud-move': { // Existing animation for the loading cloud
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      // Apply the keyframes as animations with specific durations and easing
      animation: {
        'liquid-shine': 'liquid-shine 8s infinite cubic-bezier(0.8, 0.2, 0.2, 0.8)', // Smooth, continuous shine
        'cloud-move': 'cloud-move 2.2s ease-in-out infinite', // Apply your cloud animation
      },
      // You can define custom backdrop-blur values if Tailwind's defaults (sm, md, lg, xl) aren't enough
      backdropBlur: {
        'lg': '12px', // Standard blur for glass effect
        'xl': '24px', // More intense blur for overlays
      }
    },
  },
  plugins: [
    // This Tailwind plugin allows you to add custom CSS classes
    function({ addComponents, theme }) {
      addComponents({
        '.liquid-glass-element': {
          background: 'rgba(255, 255, 255, 0.08)', // Base background with transparency for the frosted effect
          backdropFilter: 'blur(12px) saturate(180%)', // Core blur and saturation for the glass look
          WebkitBackdropFilter: 'blur(12px) saturate(180%)', // For Safari compatibility
          border: '1px solid rgba(255, 255, 255, 0.18)', // Subtle white border for definition
          boxShadow: `${theme('boxShadow.glass-outer')}, ${theme('boxShadow.glass-inner')}`, // Combined outer and inner shadows
          borderRadius: theme('borderRadius.xl'), // Default rounded corners from Tailwind's theme
          position: 'relative', // Essential for positioning the shine overlay inside
          overflow: 'hidden', // Crucial to contain the animated shine within the element's bounds
        },
        // Styles specifically for the animated "shine" overlay that creates the liquid effect
        '.liquid-glass-shine-overlay': {
          content: "''", // Required for pseudo-elements, though here it's a real div
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          borderRadius: 'inherit', // Inherit the border-radius from the parent .liquid-glass-element
          background: 'linear-gradient(270deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.0) 100%)', // Subtle white gradient for the shine
          filter: 'blur(20px)', // Blurs the gradient itself to make it soft and liquid-like
          transform: 'scaleX(1.5) skewX(-20deg) translateX(-150%)', // Initial transform for the animation
          animation: 'liquid-shine 8s infinite cubic-bezier(0.8, 0.2, 0.2, 0.8)', // Apply the custom shine animation
          pointerEvents: 'none', // Allows mouse events to pass through to the element below
          zIndex: '0', // Ensures the shine stays behind the main content of the glass element
        },
        // Custom styles for the mobile navigation bar at the bottom
        '.liquid-glass-nav': {
          background: 'rgba(60, 150, 250, 0.15)', // A slightly blue, more opaque transparent background
          backdropFilter: 'blur(16px) saturate(180%)', // More intense blur for a distinct feel
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)', // Subtle top border
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1), inset 0 2px 10px rgba(255, 255, 255, 0.1)', // Shadows for depth
          borderRadius: theme('borderRadius.xl'), // Consistent rounded corners
        },
      });
    }
  ],
};
