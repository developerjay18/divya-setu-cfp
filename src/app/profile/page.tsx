import { redirect } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProfileForm from '@/components/profile/ProfileForm';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

async function getUserProfile(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return null;
    }
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
      accountType: user.accountType,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const currentUser = await requireAuth();
  
  if (!currentUser) {
    redirect('/auth/login');
  }
  
  const userProfile = await getUserProfile(currentUser.id);
  
  if (!userProfile) {
    redirect('/dashboard');
  }
  
  return (
    <MainLayout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-100 sm:text-3xl sm:truncate">
                  Profile
                </h1>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-700">
                    Personal details and account settings.
                  </p>
                </div>
                
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-700">
                        Full name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userProfile.name}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-700">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userProfile.email}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-700">
                        Account type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize sm:mt-0 sm:col-span-2">
                        {userProfile.accountType}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-700">
                        Member since
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userProfile.createdAt 
                          ? new Date(userProfile.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="mt-10 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Edit Profile
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-700">
                    Update your personal information.
                  </p>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <ProfileForm initialData={userProfile} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
} 