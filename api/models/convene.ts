import mongoose from 'mongoose';

const conveneSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  qualityLevel: {
    type: Number,
    index: true
  },
  resourceId: Number,
  resourceType: String,
  cardPoolType: {
    type: Number,
    index: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    index: true
  }
});

export const ConveneModel = mongoose.model('convenes', conveneSchema);
export default ConveneModel;
