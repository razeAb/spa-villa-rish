// postcss.config.mjs or postcss.config.js (ESM)
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    // autoprefixer: {}, // optional
  },
};
// postcss.config.cjs
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    // autoprefixer: {}, // optional
  },
};
