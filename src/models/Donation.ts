import mongoose, { Schema } from 'mongoose';

export interface IDonation extends mongoose.Document {
  fundraiserId: mongoose.Types.ObjectId;
  donorId?: mongoose.Types.ObjectId;
  donorName: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    fundraiserId: {
      type: Schema.Types.ObjectId,
      ref: 'Fundraiser',
      required: [true, 'Please provide the fundraiser ID'],
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    donorName: {
      type: String,
      required: [true, 'Please provide the donor name'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the donation amount'],
      min: [1, 'Donation amount must be at least 1'],
    },
    transactionId: {
      type: String,
      required: [true, 'Please provide the transaction ID'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema); 