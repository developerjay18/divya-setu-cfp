import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';
import Fundraiser from '@/models/Fundraiser';
import { authOptions } from '@/lib/auth';

// Schema for creating donation
const donationSchema = z.object({
  fundraiserId: z.string(),
  donorName: z.string().min(2, 'Donor name must be at least 2 characters'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  transactionId: z.string().min(3, 'Transaction ID is required'),
});

// GET all donations a user has made
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const fundraiserId = url.searchParams.get('fundraiserId');
    
    await connectDB();
    
    let query: any = {};
    
    // If user is a donor, only fetch their donations
    if (session.user.accountType === 'donor') {
      query.donorId = session.user.id;
    } 
    // If user is an organization and fundraiserId is provided
    else if (session.user.accountType === 'organization' && fundraiserId) {
      // First check if the fundraiser belongs to this organization
      const fundraiser = await Fundraiser.findById(fundraiserId);
      
      if (!fundraiser) {
        return NextResponse.json(
          { error: 'Fundraiser not found' },
          { status: 404 }
        );
      }
      
      if (fundraiser.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have access to these donations' },
          { status: 403 }
        );
      }
      
      query.fundraiserId = fundraiserId;
    }
    // If organization but no fundraiserId, get all donations for all their fundraisers
    else if (session.user.accountType === 'organization') {
      const userFundraisers = await Fundraiser.find({ createdBy: session.user.id });
      const fundraiserIds = userFundraisers.map(f => f._id);
      query.fundraiserId = { $in: fundraiserIds };
    }
    
    const donations = await Donation.find(query)
      .populate('fundraiserId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching donations' },
      { status: 500 }
    );
  }
}

// POST create a new donation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input data
    const result = donationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { fundraiserId, donorName, amount, transactionId } = body;
    
    await connectDB();
    
    // Check if fundraiser exists
    const fundraiser = await Fundraiser.findById(fundraiserId);
    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }
    
    // Get session (optional for anonymous donations)
    const session = await getServerSession(authOptions);
    let donorId;
    
    if (session) {
      donorId = session.user.id;
    }
    
    const newDonation = await Donation.create({
      fundraiserId,
      donorId,
      donorName,
      amount,
      transactionId,
      status: 'pending',
    });
    
    return NextResponse.json(
      { message: 'Donation recorded successfully', donation: newDonation },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'An error occurred while recording the donation' },
      { status: 500 }
    );
  }
} 