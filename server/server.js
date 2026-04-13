/**
 * Backend Server Entry Point
 * --------------------------
 * Configures the Express application, sets up middleware (CORS, JSON parsing),
 * connects to MongoDB Atlas, and defines the API endpoints for records and authentication.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Route Imports
const recordRoutes = require('./routes/recordRoutes');
const authRoutes = require('./routes/authRoutes');
const Admin = require('./models/adminModel');

const app = express();

// ✅ REQUIRED for Render (fixes secure cookies behind proxy)
app.set('trust proxy', 1);

// ✅ Simplified & correct CORS for Vercel → Render
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies for JWT extraction

// Routes
app.use('/api/records', recordRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

// Seed admin users using credentials from .env
const seedAdmins = async () => {
  const admins = [
    { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD },
    { username: process.env.ADMIN2_USERNAME, password: process.env.ADMIN2_PASSWORD }
  ];

  for (const admin of admins) {
    if (!admin.username || !admin.password) continue;

    const exists = await Admin.findOne({ username: admin.username });
    if (!exists) {
      await Admin.create(admin);
      console.log(`Admin "${admin.username}" created`);
    }
  }
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    await seedAdmins();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));