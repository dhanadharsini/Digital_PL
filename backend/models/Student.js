import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  regNo: {
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
  yearOfStudy: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  hostelName: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  parentName: {
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
  },
  isOnVacation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.generateResetToken = async function() {
  const tempPassword = Math.random().toString(36).slice(-12).toUpperCase();
  this.resetToken = tempPassword;
  this.resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return tempPassword;
};

studentSchema.methods.resetPassword = async function(newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  this.resetToken = null;
  this.resetTokenExpiry = null;
  return await this.save();
};

const Student = mongoose.model('Student', studentSchema);
export default Student;