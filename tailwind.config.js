/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { brand: { 500: "#12b886", 600: "#0ca678" } },
    },
  },
  plugins: [],
};
