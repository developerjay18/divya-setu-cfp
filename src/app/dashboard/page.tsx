import Link from 'next/link';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import DonationApprovalTable from '@/components/dashboard/DonationApprovalTable';
import DonationHistoryTable from '@/components/dashboard/DonationHistoryTable';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';

async function getFundraiserCount(userId: string): Promise<number> {
  try {
    await connectDB();
    return await Fundraiser.countDocuments({ createdBy: userId });
  } catch (error) {
    console.error('Error counting fundraisers:', error);
    return 0;
  }
}

export default async function Dashboard() {
  const user = await requireAuth();
  const isOrganization = user.accountType === 'organization';
  
  const fundraiserCount = isOrganization ? await getFundraiserCount(user.id) : 0;
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-gray-100 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-lg text-gray-100">
              {isOrganization
                ? 'Manage your fundraisers and donations'
                : 'Track your contributions'}
            </p>
          </div>
          
          {isOrganization && (
            <div className="mt-4 md:mt-0 md:ml-4">
              <Link
                href="/dashboard/fundraisers/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create New Fundraiser
              </Link>
            </div>
          )}
        </div>
        
        {/* Dashboard Stats */}
        <div className="mt-8">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isOrganization && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Fundraisers
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {fundraiserCount}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link
                      href="/dashboard/fundraisers"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      View all fundraisers
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Account Type
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 capitalize">
                  {user.accountType}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link
                    href="/profile"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </div>
          </dl>
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-200 mb-6">
            {isOrganization
              ? 'Donation Approvals'
              : 'Your Donation History'}
          </h2>
          
          {isOrganization ? (
            <DonationApprovalTable />
          ) : (
            <DonationHistoryTable />
          )}
        </div>
      </div>
    </MainLayout>
  );
} 