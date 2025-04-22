import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Donation from '@/models/Donation';
import Fundraiser from '@/models/Fundraiser';
import { authOptions } from '@/lib/auth';

// Schema for updating donation status
const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

// GET a specific donation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const donation = await Donation.findById(id)
      .populate('fundraiserId', 'title');
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    // Check access permissions
    if (session.user.accountType === 'donor' && 
        donation.donorId && 
        donation.donorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this donation' },
        { status: 403 }
      );
    }
    
    if (session.user.accountType === 'organization') {
      // Check if this donation is for a fundraiser created by this organization
      const fundraiser = await Fundraiser.findById(donation.fundraiserId);
      
      if (!fundraiser || fundraiser.createdBy.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have access to this donation' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the donation' },
      { status: 500 }
    );
  }
}

// PATCH update donation status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only organizations can approve/reject donations
    if (session.user.accountType !== 'organization') {
      return NextResponse.json(
        { error: 'Only organizations can approve or reject donations' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    // Validate input data
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }
    
    // Check if the organization owns the fundraiser for this donation
    const fundraiser = await Fundraiser.findById(donation.fundraiserId);
    
    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }
    
    if (fundraiser.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this donation' },
        { status: 403 }
      );
    }
    
    // Update donation status
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      {
        status: body.status,
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      { new: true }
    );
    
    return NextResponse.json(
      { 
        message: `Donation has been ${body.status}`,
        donation: updatedDonation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the donation' },
      { status: 500 }
    );
  }
} 