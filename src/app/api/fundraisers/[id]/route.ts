import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';
import { authOptions } from '@/lib/auth';

// GET a specific fundraiser by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await connectDB();
    
    const fundraiser = await Fundraiser.findById(id)
      .populate('createdBy', 'name email');
    
    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(fundraiser);
  } catch (error) {
    console.error('Error fetching fundraiser:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the fundraiser' },
      { status: 500 }
    );
  }
}

// DELETE a fundraiser
export async function DELETE(
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
    
    const fundraiser = await Fundraiser.findById(id);
    
    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the creator of the fundraiser
    if (fundraiser.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this fundraiser' },
        { status: 403 }
      );
    }
    
    await Fundraiser.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Fundraiser deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting fundraiser:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the fundraiser' },
      { status: 500 }
    );
  }
} 