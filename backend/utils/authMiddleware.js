// utils/authMiddleware.js
const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    const payload = jwt.verify(token, secret);
    if (payload.role !== "manager") return res.status(403).json({ error: "Forbidden" });
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
