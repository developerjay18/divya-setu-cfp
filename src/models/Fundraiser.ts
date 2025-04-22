import mongoose, { Schema } from 'mongoose';

export interface IFundraiser extends mongoose.Document {
  title: string;
  description: string;
  targetAmount?: number;
  upiId: string;
  qrCodeImage?: string;
  category: 'NGO' | 'Religious' | 'Institute';
  thumbnailImage?: string;
  bannerImage?: string;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FundraiserSchema = new Schema<IFundraiser>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    targetAmount: {
      type: Number,
    },
    upiId: {
      type: String,
      required: [true, 'Please provide a UPI ID'],
    },
    qrCodeImage: {
      type: String,
    },
    category: {
      type: String,
      enum: ['NGO', 'Religious', 'Institute'],
      required: [true, 'Please select a category'],
    },
    thumbnailImage: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the creator ID'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Fundraiser || mongoose.model<IFundraiser>('Fundraiser', FundraiserSchema); 