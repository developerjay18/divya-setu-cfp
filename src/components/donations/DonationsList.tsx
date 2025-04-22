"use client";

import { useEffect, useState } from 'react';

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string;
}

interface FundraiserStats {
  fundraiserId: string;
  title: string;
  targetAmount: number | null;
  totalRaised: number;
  donationCount: number;
  recentDonations: Donation[];
}

interface DonationsListProps {
  fundraiserId: string;
}

export default function DonationsList({ fundraiserId }: DonationsListProps) {
  const [stats, setStats] = useState<FundraiserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/fundraisers/${fundraiserId}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch donations');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load donations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [fundraiserId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Donations</h2>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Donations</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Donations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-md">
          <p className="text-sm text-indigo-700 font-medium">Total Raised</p>
          <p className="text-2xl font-bold text-indigo-900">
            ₹{stats?.totalRaised.toLocaleString() || 0}
          </p>
        </div>
        
        {stats?.targetAmount && (
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-700 font-medium">Target Amount</p>
            <p className="text-2xl font-bold text-green-900">
              ₹{stats.targetAmount.toLocaleString()}
            </p>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ 
                  width: `${Math.min(
                    (stats.totalRaised / stats.targetAmount) * 100, 
                    100
                  )}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-green-700 mt-1">
              {Math.round((stats.totalRaised / stats.targetAmount) * 100)}% of target
            </p>
          </div>
        )}
      </div>
      
      {stats?.recentDonations && stats.recentDonations.length > 0 ? (
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Recent Donations</h3>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Donor
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {donation.donorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{donation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-700">
          No donations yet. Be the first to donate!
        </div>
      )}
    </div>
  );
} 