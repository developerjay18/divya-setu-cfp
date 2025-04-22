import Link from 'next/link';
import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { requireOrganization } from '@/lib/auth';
import connectDB from '@/lib/db';
import Fundraiser from '@/models/Fundraiser';
import { IFundraiser } from '@/models/Fundraiser';

async function getUserFundraisers(userId: string): Promise<IFundraiser[]> {
  try {
    await connectDB();
    
    const fundraisers = await Fundraiser.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(fundraisers));
  } catch (error) {
    console.error('Error fetching user fundraisers:', error);
    return [];
  }
}

export default async function ManageFundraisersPage() {
  // Ensure user is authenticated and is an organization
  const user = await requireOrganization();
  
  // Fetch fundraisers created by the user
  const fundraisers = await getUserFundraisers(user.id);
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Your Fundraisers
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your fundraising campaigns and track donations.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/fundraisers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Fundraiser
            </Link>
          </div>
        </div>
        
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }
        >
          {fundraisers.length > 0 ? (
            <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {fundraisers.map((fundraiser) => (
                    <tr key={fundraiser._id?.toString()}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">
                          {fundraiser.title}
                        </div>
                        <div className="text-gray-500 truncate max-w-xs">
                          {fundraiser.description.substring(0, 100)}
                          {fundraiser.description.length > 100 ? '...' : ''}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                          {fundraiser.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            fundraiser.isPublic
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {fundraiser.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(fundraiser.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            href={`/fundraisers/${fundraiser._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/fundraisers/${fundraiser._id}/donations`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Donations
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md bg-white py-16 px-6 text-center shadow">
              <h3 className="text-lg font-medium text-gray-900">
                No fundraisers yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new fundraiser.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/fundraisers/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Fundraiser
                </Link>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </MainLayout>
  );
} 