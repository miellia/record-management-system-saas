const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// ✅ Hash password before saving
adminSchema.pre('save', async function() {
  const isHashed = this.password.startsWith('$2a$');
  
  if (!this.isModified('password') && isHashed) return;
  
  console.log(`Hashing password for user: ${this.username}`);
  this.password = await bcrypt.hash(this.password, 10);
});

// ✅ Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
