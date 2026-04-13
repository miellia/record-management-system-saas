const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');

const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');

// Generate JWT Helper
const generateToken = (username, rememberMe) => {
  return jwt.sign({ username }, process.env.JWT_SECRET || 'fallback_secret_for_dev_mode', {
    expiresIn: rememberMe ? '30d' : '1d',
  });
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const admin = await Admin.findOne({ username, password });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(admin.username, rememberMe);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Secure in production
      sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
      maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000 // 30 days or 1 day
    });

    res.status(200).json({ message: 'Login successful', username: admin.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// Verify Session
router.get('/verify', protect, (req, res) => {
  res.status(200).json({ message: 'Authenticated', username: req.admin.username });
});

module.exports = router;
