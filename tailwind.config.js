// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Define custom box-shadow for glass
      boxShadow: {
        'glass-inner': 'inset 0 4px 20px rgba(255, 255, 255, 0.3)', // Inner light reflection
        'glass-outer': '0 8px 32px rgba(31, 38, 135, 0.2)', // Soft outer shadow
      },
      // Define custom keyframes for the moving liquid shine and your cloud animation
      keyframes: {
        'liquid-shine': {
          '0%': { transform: 'scaleX(1.5) skewX(-20deg) translateX(-150%)' },
          '100%': { transform: 'scaleX(1.5) skewX(-20deg) translateX(150%)' },
        },
        'cloud-move': { // Your existing cloud animation
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      // Apply the keyframes as animations
      animation: {
        'liquid-shine': 'liquid-shine 8s infinite cubic-bezier(0.8, 0.2, 0.2, 0.8)',
        'cloud-move': 'cloud-move 2.2s ease-in-out infinite',
      },
      // Custom backdrop-blur values (Tailwind's defaults are often sufficient, but you can define custom ones)
      backdropBlur: {
        'lg': '12px',
        'xl': '24px',
      }
    },
  },
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        '.liquid-glass-element': {
          background: 'rgba(255, 255, 255, 0.08)', // Base background with transparency
          backdropFilter: 'blur(12px) saturate(180%)', // Core glass effect
          WebkitBackdropFilter: 'blur(12px) saturate(180%)', // For Safari compatibility
          border: '1px solid rgba(255, 255, 255, 0.18)', // Subtle white border
          boxShadow: `${theme('boxShadow.glass-outer')}, ${theme('boxShadow.glass-inner')}`, // Combined shadows
          borderRadius: theme('borderRadius.xl'), // Default rounded corners
          position: 'relative', // Necessary for absolute positioning of shine
          overflow: 'hidden', // Crucial to contain the shine animation
        },
        // Styles for the moving shine overlay
        '.liquid-glass-shine-overlay': {
          content: "''",
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          borderRadius: 'inherit', // Inherit border-radius from parent
          background: 'linear-gradient(270deg, rgba(255, 255, 255, 0.0) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.0) 100%)', // Subtle white gradient
          filter: 'blur(20px)', // Blur the shine itself
          transform: 'scaleX(1.5) skewX(-20deg) translateX(-150%)', // Initial position for animation
          animation: 'liquid-shine 8s infinite cubic-bezier(0.8, 0.2, 0.2, 0.8)', // Apply the custom animation
          pointerEvents: 'none', // Allow clicks to pass through
          zIndex: '0', // Keep it behind the main content
        },
        // Custom styles for the mobile navigation at the bottom
        '.liquid-glass-nav': {
          background: 'rgba(60, 150, 250, 0.15)', // A slightly blue, transparent background
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1), inset 0 2px 10px rgba(255, 255, 255, 0.1)',
          borderRadius: theme('borderRadius.xl'),
        },
      });
    }
  ],
};
