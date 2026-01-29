import mongoose from 'mongoose';

const entryExitLogSchema = new mongoose.Schema({
  permissionLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PermissionLetter',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  regNo: {
    type: String,
    required: true
  },
  exitTime: {
    type: Date,
    default: null
  },
  entryTime: {
    type: Date,
    default: null
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden',
    required: true
  }
}, {
  timestamps: true
});

const EntryExitLog = mongoose.model('EntryExitLog', entryExitLogSchema);
export default EntryExitLog;