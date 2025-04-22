import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';
import { authOptions } from '@/lib/auth';

// Schema for creating fundraiser
const fundraiserSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetAmount: z.number().optional(),
  upiId: z.string().min(1, 'UPI ID is required'),
  qrCodeImage: z.string().optional(),
  category: z.enum(['NGO', 'Religious', 'Institute']),
  thumbnailImage: z.string().optional(),
  bannerImage: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// GET all fundraisers or filter by category
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const userId = url.searchParams.get('userId');
    
    await connectDB();
    
    let query: any = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (userId) {
      query.createdBy = userId;
    }
    
    const fundraisers = await Fundraiser.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(fundraisers);
  } catch (error) {
    console.error('Error fetching fundraisers:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching fundraisers' },
      { status: 500 }
    );
  }
}

// POST create a new fundraiser
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user.accountType !== 'organization') {
      return NextResponse.json(
        { error: 'Only organizations can create fundraisers' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Validate input data
    const result = fundraiserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const newFundraiser = await Fundraiser.create({
      ...body,
      createdBy: session.user.id,
    });
    
    return NextResponse.json(
      { message: 'Fundraiser created successfully', fundraiser: newFundraiser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating fundraiser:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the fundraiser' },
      { status: 500 }
    );
  }
} 