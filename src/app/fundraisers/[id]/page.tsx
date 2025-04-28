import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import DonationForm from '@/components/donations/DonationForm';
import DonationsList from '@/components/donations/DonationsList';
import ShareButtons from '@/components/fundraisers/ShareButtons';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';
import { IFundraiser } from '@/models/Fundraiser';

interface FundraiserDetailPageProps {
  params: {
    id: string;
  };
}

async function getFundraiser(id: string): Promise<IFundraiser | null> {
  try {
    await connectDB();
    
    const fundraiser = await Fundraiser.findById(id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!fundraiser) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(fundraiser));
  } catch (error) {
    console.error('Error fetching fundraiser:', error);
    return null;
  }
}

export default async function FundraiserDetailPage({ params }: FundraiserDetailPageProps) {
  // Use destructuring to ensure id is extracted before being used
  const { id } = params;
  const fundraiser = await getFundraiser(id);
  
  if (!fundraiser) {
    notFound();
  }
  
  // Ensure _id is treated as a string
  const fundraiserId = String(fundraiser._id);
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {/* Fundraiser header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
                {fundraiser.title}
              </h1>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                  {fundraiser.category}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  Created by{' '}
                  <span className="font-medium text-gray-200">
                    {(fundraiser.createdBy as any)?.name || 'Anonymous'}
                  </span>
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {new Date(fundraiser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Fundraiser banner image */}
            <div className="mb-8 aspect-video overflow-hidden rounded-lg relative">
              {fundraiser.bannerImage || fundraiser.thumbnailImage ? (
                <Image
                  src={fundraiser.bannerImage || fundraiser.thumbnailImage || ''}
                  alt={fundraiser.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-500">
                    {fundraiser.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Fundraiser description */}
            <div className="prose prose-indigo mb-8 max-w-none">
              <h2 className="text-2xl font-bold">About this fundraiser</h2>
              <div className="mt-4 whitespace-pre-line text-gray-200">
                {fundraiser.description}
              </div>
            </div>
            
            {/* Donations list */}
            <DonationsList fundraiserId={fundraiserId} />
          </div>
          
          {/* Sidebar - 1/3 width on large screens */}
          <div className="mt-10 lg:mt-0">
            <div className="sticky top-8 space-y-8">
              {/* Donation form */}
              <DonationForm
                fundraiserId={fundraiserId}
                upiId={fundraiser.upiId}
                qrCodeImage={fundraiser.qrCodeImage}
              />
              
              {/* Organization info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Organized by
                </h3>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-indigo-600">
                      {((fundraiser.createdBy as any)?.name || 'Anonymous').charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {(fundraiser.createdBy as any)?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(fundraiser.createdBy as any)?.email || ''}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Only donate to organizations you trust. If you have any concerns about this fundraiser, please contact us.
                </p>
              </div>
              
              {/* Share buttons - Using client component */}
              <ShareButtons fundraiserId={fundraiserId} title={fundraiser.title} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 