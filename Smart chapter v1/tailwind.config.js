/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Extend with design system colors if needed
      colors: {
        // Add custom colors from design-system.css if needed
      },
    },
  },
  plugins: [],
}
