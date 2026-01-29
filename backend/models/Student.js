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
  isOnVacation: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
export default Student;