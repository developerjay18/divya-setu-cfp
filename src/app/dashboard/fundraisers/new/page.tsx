import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import FundraiserForm from '@/components/fundraisers/FundraiserForm';
import { requireOrganization } from '@/lib/auth';

export default async function NewFundraiserPage() {
  // Ensure user is authenticated and is an organization
  await requireOrganization();
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create New Fundraiser
            </h1>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Dashboard
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the form below to create a new fundraiser. Fields marked with an asterisk (*) are required.
          </p>
        </div>
        
        <FundraiserForm />
      </div>
    </MainLayout>
  );
} 