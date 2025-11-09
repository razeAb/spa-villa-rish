// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// לצורך הדמו: משתמש/סיסמה ב-.env או DB
router.post('/login', (req,res) => {
  const { username, password } = req.body;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role:'manager' }, secret, { expiresIn: '8h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
