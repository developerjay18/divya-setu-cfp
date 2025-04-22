import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const searchParams = request.nextUrl.searchParams;
  const shareType = searchParams.get('type');
  
  try {
    // Validate the fundraiser exists
    await connectDB();
    const fundraiser = await Fundraiser.findById(id);
    
    if (!fundraiser) {
      return NextResponse.redirect(new URL('/fundraisers', request.url));
    }
    
    // For copy type, redirect back to the fundraiser page
    if (shareType === 'copy') {
      // We'll handle the actual copy functionality client-side
      return NextResponse.redirect(new URL(`/fundraisers/${id}`, request.url));
    }
    
    // Default: Redirect back to the fundraiser
    return NextResponse.redirect(new URL(`/fundraisers/${id}`, request.url));
  } catch (error) {
    console.error('Error in share handler:', error);
    return NextResponse.redirect(new URL('/fundraisers', request.url));
  }
} 