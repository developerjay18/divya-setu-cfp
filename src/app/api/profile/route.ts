import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  image: z.string().url('Must be a valid URL').nullable(),
});

export async function PATCH(
  request: NextRequest
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    try {
      profileUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          name: body.name,
          image: body.image,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'No changes made' },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 