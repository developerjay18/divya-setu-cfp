import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';
import Fundraiser from '@/models/Fundraiser';

interface Params {
  params: {
    id: string;
  };
}

// GET fundraiser stats with approved donations
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    await connectDB();
    
    // Check if fundraiser exists
    const fundraiser = await Fundraiser.findById(id);
    
    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }
    
    // Get approved donations for this fundraiser
    const approvedDonations = await Donation.find({
      fundraiserId: id,
      status: 'approved'
    }).sort({ createdAt: -1 });
    
    // Calculate total amount raised from approved donations
    const totalRaised = approvedDonations.reduce((sum, donation) => sum + donation.amount, 0);
    
    // Create response object with essential donor info (no sensitive data)
    const donorsInfo = approvedDonations.map(donation => ({
      id: donation._id,
      donorName: donation.donorName,
      amount: donation.amount,
      createdAt: donation.createdAt
    }));
    
    return NextResponse.json({
      fundraiserId: id,
      title: fundraiser.title,
      targetAmount: fundraiser.targetAmount || null,
      totalRaised,
      donationCount: approvedDonations.length,
      recentDonations: donorsInfo
    });
  } catch (error) {
    console.error('Error fetching fundraiser stats:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching fundraiser statistics' },
      { status: 500 }
    );
  }
} 