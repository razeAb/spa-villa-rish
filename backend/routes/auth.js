// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// לצורך הדמו: משתמש/סיסמה ב-.env או DB
router.post('/login', (req,res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role:'manager' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;