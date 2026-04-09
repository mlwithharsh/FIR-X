/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./forms/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#162029",
        sand: "#f3efe4",
        rust: "#8b3d2e",
        olive: "#6c7b57"
      },
      boxShadow: {
        panel: "0 18px 40px rgba(22, 32, 41, 0.08)"
      }
    }
  },
  plugins: []
};
