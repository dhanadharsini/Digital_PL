import mongoose from 'mongoose';

const permissionLetterSchema = new mongoose.Schema({
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
  roomNo: {
    type: String,
    required: true
  },
  hostelName: {
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
  placeOfVisit: {
    type: String,
    required: true
  },
  reasonOfVisit: {
    type: String,
    required: true
  },
  departureDateTime: {
    type: Date,
    required: true
  },
  arrivalDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'parent-approved', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  parentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  wardenStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  qrCode: {
    type: String,
    default: ''
  },
  isFullyUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const PermissionLetter = mongoose.model('PermissionLetter', permissionLetterSchema);
export default PermissionLetter;