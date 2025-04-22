"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Donation {
  _id: string;
  fundraiserId: {
    _id: string;
    title: string;
  };
  donorName: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function DonationApprovalTable() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/donations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch donations');
        }
        
        const data = await response.json();
        setDonations(data);
      } catch (error) {
        console.error('Error fetching donations:', error);
        setError('Failed to load donations. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonations();
  }, []);

  const handleAction = async (donationId: string, status: 'approved' | 'rejected') => {
    try {
      setActionInProgress(donationId);
      
      const response = await fetch(`/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update donation status');
      }
      
      // Update the local state
      setDonations(donations.map(donation => 
        donation._id === donationId 
          ? { ...donation, status } 
          : donation
      ));
    } catch (error) {
      console.error('Error updating donation status:', error);
      alert((error as Error).message);
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!donations.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-center text-gray-700">
          No donations received yet.
        </p>
      </div>
    );
  }

  // Group donations by fundraiser
  const groupedDonations: { [key: string]: Donation[] } = {};
  donations.forEach(donation => {
    const fundraiserId = donation.fundraiserId._id;
    if (!groupedDonations[fundraiserId]) {
      groupedDonations[fundraiserId] = [];
    }
    groupedDonations[fundraiserId].push(donation);
  });

  return (
    <div className="space-y-8">
      {Object.entries(groupedDonations).map(([fundraiserId, donations]) => (
        <div key={fundraiserId} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50">
            <h3 className="text-lg font-semibold text-indigo-700">
              <Link href={`/fundraisers/${fundraiserId}`} className="hover:underline">
                {donations[0].fundraiserId.title}
              </Link>
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Donor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map(donation => (
                  <tr key={donation._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {donation.donorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{donation.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {donation.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        donation.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : donation.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {donation.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleAction(donation._id, 'approved')}
                            disabled={actionInProgress === donation._id}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(donation._id, 'rejected')}
                            disabled={actionInProgress === donation._id}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
} 