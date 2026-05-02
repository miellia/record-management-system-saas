const express = require('express');
const router = express.Router();
const Admin = require('../models/adminModel');

const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');

// ✅ Generate JWT (FIXED: using env secret properly)
const generateToken = (username, rememberMe) => {
  return jwt.sign(
    { username },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberMe ? '30d' : '1d',
    }
  );
};

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    console.log(`Login attempt for username: ${username}`);

    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log(`Login failed: Admin ${username} not found`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await admin.comparePassword(password);
    console.log(`Password match result for ${username}: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(admin.username, rememberMe);

    // ✅ CRITICAL: Proper cookie config for cross-domain (Vercel ↔ Render)
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,        // required for HTTPS
      sameSite: 'None',    // required for cross-site cookies
      maxAge: (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Login successful',
      username: admin.username
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Logout
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// ✅ Verify Session
router.get('/verify', protect, (req, res) => {
  res.status(200).json({
    message: 'Authenticated',
    username: req.admin.username
  });
});

module.exports = router;