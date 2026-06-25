const express = require('express');
const router = express.Router();

// Tạo các function giả để test
const register = (req, res) => {
  res.json({ success: true, message: 'User registered' });
};

const login = (req, res) => {
  res.json({ success: true, message: 'User logged in' });
};

const getMe = (req, res) => {
  res.json({ success: true, user: null });
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);

module.exports = router;