/**
 * Backend Server Entry Point
 * --------------------------
 * Configures the Express application, sets up middleware (CORS, JSON parsing),
 * connects to MongoDB Atlas, and defines the API endpoints for records and authentication.
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const recordRoutes = require('./routes/recordRoutes');
const authRoutes = require('./routes/authRoutes');
const Admin = require('./models/adminModel');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

app.use('/api/records', recordRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://miellia26:admin0413@newera.fxz3fhy.mongodb.net/?appName=NewEra";

// Seed admin users
const seedAdmins = async () => {
  const admins = [
    { username: 'admin', password: 'admin0413' },
    { username: 'jawed', password: 'jawed0321' }
  ];

  for (const admin of admins) {
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
