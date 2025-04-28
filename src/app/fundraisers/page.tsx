import { Suspense } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import FundraiserCard from '@/components/fundraisers/FundraiserCard';
import { IFundraiser } from '@/models/Fundraiser';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';

// Helper to fetch fundraisers with optional category filter
async function getFundraisers(category?: string): Promise<IFundraiser[]> {
  try {
    await connectDB();
    
    let query: any = { isPublic: true };
    if (category) {
      query.category = category;
    }
    
    const fundraisers = await Fundraiser.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(fundraisers));
  } catch (error) {
    console.error('Error fetching fundraisers:', error);
    return [];
  }
}

interface FundraisersPageProps {
  searchParams: { category?: string };
}

export default async function FundraisersPage({ searchParams }: FundraisersPageProps) {
  const { category } = searchParams;
  const fundraisers = await getFundraisers(category);
  
  const categories = ['NGO', 'Religious', 'Institute'];
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-100 sm:text-4xl">
              Fundraisers
            </h1>
            <p className="mt-2 text-lg text-gray-200">
              Browse fundraisers and donate to causes you care about.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/auth/register"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Start a Fundraiser
            </Link>
          </div>
        </div>
        
        <div className="mt-8 border-b border-gray-200 pb-5">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-gray-100">
              {category ? `${category} Fundraisers` : 'All Fundraisers'}
            </h3>
            <div className="mt-3 sm:mt-0">
              <div className="flex rounded-md shadow-sm">
                <Link
                  href="/fundraisers"
                  className={`inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium ${
                    !category
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/fundraisers?category=${cat}`}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                      cat === category
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    } ${
                      cat === 'NGO'
                        ? ''
                        : cat === 'Institute'
                        ? 'rounded-r-md'
                        : ''
                    } border-l-0`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Suspense
          fallback={
            <div className="mt-8 flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }
        >
          {fundraisers.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {fundraisers.map((fundraiser) => (
                <FundraiserCard
                  key={fundraiser._id?.toString() || Math.random().toString()}
                  fundraiser={fundraiser}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-md bg-white py-16 text-center shadow">
              <h3 className="text-lg font-medium text-gray-900">
                No fundraisers found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {category
                  ? `There are no ${category} fundraisers available at the moment.`
                  : 'There are no fundraisers available at the moment.'}
              </p>
              {category && (
                <div className="mt-6">
                  <Link
                    href="/fundraisers"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View all fundraisers
                  </Link>
                </div>
              )}
            </div>
          )}
        </Suspense>
      </div>
    </MainLayout>
  );
} 