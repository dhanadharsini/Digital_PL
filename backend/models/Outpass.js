// backend/models/Outpass.js

import mongoose from 'mongoose';

const outpassSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  regNo: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  yearOfStudy: {
    type: String,
    required: true
  },
  roomNo: {
    type: String,
    required: true
  },
  hostelName: {
    type: String,
    required: true
  },
  placeOfVisit: {
    type: String,
    required: true
  },
  exitTime: {
    type: Date,
    default: null
  },
  expectedReturnTime: {
    type: Date,
    default: null
  },
  actualReturnTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'delayed'],
    default: 'active'
  },
  isDelayed: {
    type: Boolean,
    default: false
  },
  delayDuration: {
    type: Number, // in minutes
    default: 0
  },
  qrCode: {
    type: String,
    required: true
  },
  exitApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    default: null
  },
  entryApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    default: null
  }
}, {
  timestamps: true
});

const Outpass = mongoose.model('Outpass', outpassSchema);
export default Outpass;