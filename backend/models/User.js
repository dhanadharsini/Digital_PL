import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateResetToken = async function() {
  const tempPassword = Math.random().toString(36).slice(-12).toUpperCase();
  this.resetToken = tempPassword;
  this.resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return tempPassword;
};

userSchema.methods.resetPassword = async function(newPassword) {
  this.password = newPassword;
  this.resetToken = null;
  this.resetTokenExpiry = null;
  return await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;