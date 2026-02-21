import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const wardenSchema = new mongoose.Schema({
  wardenId: {
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
  hostelName: {
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

wardenSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

wardenSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

wardenSchema.methods.generateResetToken = async function() {
  const tempPassword = Math.random().toString(36).slice(-12).toUpperCase();
  this.resetToken = tempPassword;
  this.resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return tempPassword;
};

wardenSchema.methods.resetPassword = async function(newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  this.resetToken = null;
  this.resetTokenExpiry = null;
  return await this.save();
};

const Warden = mongoose.model('Warden', wardenSchema);
export default Warden;