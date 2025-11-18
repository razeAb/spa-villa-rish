// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { verifyPassword } = require("../utils/password");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const user = await AdminUser.findOne({ username });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ role: user.role, sub: user._id }, secret, { expiresIn: "8h" });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
