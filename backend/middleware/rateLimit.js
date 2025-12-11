const rateLimit = require("express-rate-limit");

const commonConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max requests per window per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
};

// Global/general limiter
const generalLimiter = rateLimit(commonConfig);

// Tighter limiter for sensitive endpoints (e.g., login)
const loginLimiter = rateLimit({
  ...commonConfig,
  limit: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: { error: "Too many login attempts. Try again later." },
});

module.exports = { generalLimiter, loginLimiter };
