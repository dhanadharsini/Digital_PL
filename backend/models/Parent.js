import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const parentSchema = new mongoose.Schema({
  parentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
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
  mobileNo: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRegNo: {
    type: String,
    required: true
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

parentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

parentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

parentSchema.methods.generateResetToken = async function() {
  const tempPassword = Math.random().toString(36).slice(-12).toUpperCase();
  this.resetToken = tempPassword;
  this.resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return tempPassword;
};

parentSchema.methods.resetPassword = async function(newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  this.resetToken = null;
  this.resetTokenExpiry = null;
  return await this.save();
};

const Parent = mongoose.model('Parent', parentSchema);
export default Parent;