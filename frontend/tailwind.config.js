/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a5f",
        secondary: "#2d5a87",
        accent: "#00b4d8",
        success: "#28a745",
        warning: "#ffc107",
        danger: "#dc3545",
        purple: "#6f42c1",
        teal: "#20c997"
      }
    }
  },
  plugins: [],
};
