const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    res.status(200).json({ message: 'Login successful', username: admin.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
