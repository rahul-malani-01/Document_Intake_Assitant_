import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress'
    }
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);