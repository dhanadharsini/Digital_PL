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
  }
}, {
  timestamps: true
});

wardenSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

wardenSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Warden = mongoose.model('Warden', wardenSchema);
export default Warden;