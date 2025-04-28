import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import FundraiserCard from '@/components/fundraisers/FundraiserCard';
import { IFundraiser } from '@/models/Fundraiser';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';

async function getFeaturedFundraisers(): Promise<IFundraiser[]> {
  try {
    await connectDB();
    const fundraisers = await Fundraiser.find({ isPublic: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    return JSON.parse(JSON.stringify(fundraisers));
  } catch (error) {
    console.error('Error fetching featured fundraisers:', error);
    return [];
  }
}

export default async function Home() {
  const featuredFundraisers = await getFeaturedFundraisers();
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Empower Change Through Giving
              </h1>
              <p className="mt-4 text-lg text-white">
                Divya Setu connects NGOs, religious organizations, and institutes with donors to fund meaningful causes and make a positive impact in the world.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/fundraisers"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50"
                >
                  Browse Fundraisers
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm border border-indigo-400 hover:bg-indigo-500"
                >
                  Start a Fundraiser
                </Link>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full">
              <div className="absolute inset-0 bg-indigo-900/60"></div>
              <div className="relative h-full w-full">
                <Image
                  src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="People helping each other"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fundraisers Section */}
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Featured Fundraisers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Discover causes that need your support and make a difference today.
            </p>
          </div>

          <div className="mt-12">
            {featuredFundraisers.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featuredFundraisers.map((fundraiser, index) => (
                  <FundraiserCard
                    key={index}
                    fundraiser={fundraiser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No fundraisers available yet.</p>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/fundraisers"
                className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                View All Fundraisers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-100">
              Simple steps to make a difference through Divya Setu.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">
                Create an Account
              </h3>
              <p className="mt-2 text-gray-600">
                Sign up as a donor to support causes or as an organization to create fundraisers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Browse or Create Fundraisers
              </h3>
              <p className="mt-2 text-gray-600">
                Find causes to support or create your own fundraiser with details and UPI payment information.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg bg-white p-8 shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Donate & Track Impact
              </h3>
              <p className="mt-2 text-gray-600">
                Make UPI donations directly to the cause and track your contribution's impact as it's verified.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
