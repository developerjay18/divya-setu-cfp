"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const donationSchema = z.object({
  donorName: z.string().min(2, 'Donor name must be at least 2 characters'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  transactionId: z.string().min(3, 'Transaction ID is required'),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  fundraiserId: string;
  upiId: string;
  qrCodeImage?: string;
}

export default function DonationForm({
  fundraiserId,
  upiId,
  qrCodeImage,
}: DonationFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: session?.user?.name || '',
      amount: 0,
      transactionId: '',
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fundraiserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setSubmitSuccess('Thank you for your donation! It is pending approval by the organization.');
      reset({ donorName: session?.user?.name || '', amount: 0, transactionId: '' });
    } catch (error) {
      setSubmitError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Make a Donation</h2>
      
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Payment Details:</h3>
        
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm mb-2">
            Please make the payment via UPI and enter the transaction details below.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {qrCodeImage && (
              <div className="relative w-40 h-40">
                <Image
                  src={qrCodeImage}
                  alt="UPI QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            
            <div>
              <p className="text-sm mb-1">
                <span className="font-medium">UPI ID:</span> {upiId}
              </p>
              <p className="text-sm text-gray-600">
                Scan the QR code or use the UPI ID to make your payment.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="donorName"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter your name"
            {...register('donorName')}
          />
          {errors.donorName && (
            <p className="mt-1 text-sm text-red-600">{errors.donorName.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (in ₹)
          </label>
          <input
            type="number"
            id="amount"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter donation amount"
            min="1"
            step="1"
            {...register('amount', {
              valueAsNumber: true,
            })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction ID/Reference No.
          </label>
          <input
            type="text"
            id="transactionId"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter transaction ID from your payment app"
            {...register('transactionId')}
          />
          {errors.transactionId && (
            <p className="mt-1 text-sm text-red-600">{errors.transactionId.message}</p>
          )}
        </div>
        
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {submitSuccess}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-indigo-500 focus:outline-none disabled:bg-indigo-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Donation'}
        </button>
      </form>
    </div>
  );
} 