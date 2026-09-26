import mongoose from 'mongoose';

const documentStateSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      unique: true,
      index: true
    },
    full_name: { type: String, default: null },
    home_address: { type: String, default: null },
    covers_worldwide_assets: { type: Boolean, default: null },
    has_children: { type: Boolean, default: null },
    children: { type: [String], default: [] },
    executor: {
      name: { type: String, default: null },
      relationship: { type: String, default: null }
    },
    specific_gifts: { type: [String], default: [] },
    additional_wishes: { type: String, default: null }
  },
  { timestamps: true }
);

export const DocumentState = mongoose.model('DocumentState', documentStateSchema);