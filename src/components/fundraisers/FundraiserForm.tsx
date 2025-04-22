"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fundraiserSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetAmount: z.number().optional(),
  upiId: z.string().min(1, 'UPI ID is required'),
  category: z.enum(['NGO', 'Religious', 'Institute'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  isPublic: z.boolean().default(true),
});

type FundraiserFormData = z.infer<typeof fundraiserSchema>;

export default function FundraiserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FundraiserFormData>({
    resolver: zodResolver(fundraiserSchema) as any,
    defaultValues: {
      isPublic: true,
    },
  });

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (value: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 5MB');
      return;
    }
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('File must be an image (JPEG, PNG, or WebP)');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<FundraiserFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Prepare data with image
      const fundraiserData = {
        ...data,
        thumbnailImage,
        qrCodeImage,
      };
      
      const response = await fetch('/api/fundraisers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundraiserData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create fundraiser');
      }
      
      // Redirect to the new fundraiser page
      router.push(`/fundraisers/${result.fundraiser._id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating fundraiser:', error);
      setSubmitError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Create New Fundraiser</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter a title for your fundraiser"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Describe your fundraiser and its purpose"
            {...register('description')}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount (Optional)
          </label>
          <input
            id="targetAmount"
            type="number"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter target amount (in ₹)"
            min="0"
            {...register('targetAmount', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
            UPI ID
          </label>
          <input
            id="upiId"
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
            placeholder="Enter your UPI ID (e.g., name@bankname)"
            {...register('upiId')}
          />
          {errors.upiId && (
            <p className="mt-1 text-sm text-red-600">{errors.upiId.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-1">
            UPI QR Code (Optional)
          </label>
          <input
            id="qrCode"
            type="file"
            accept="image/*"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            onChange={(e) => handleImageUpload(e, setQrCodeImage)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload a QR code image for easy payments. Max size 5MB.
          </p>
          
          {qrCodeImage && (
            <div className="mt-2 relative w-40 h-40">
              <img
                src={qrCodeImage}
                alt="QR Code Preview"
                className="w-full h-full object-contain border border-gray-200 rounded-md"
              />
              <button
                type="button"
                onClick={() => setQrCodeImage(null)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                title="Remove"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="thumbnailImage" className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail Image (Optional)
          </label>
          <input
            id="thumbnailImage"
            type="file"
            accept="image/*"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            onChange={(e) => handleImageUpload(e, setThumbnailImage)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload a thumbnail image for your fundraiser. Max size 5MB.
          </p>
          
          {thumbnailImage && (
            <div className="mt-2 relative w-full h-40">
              <img
                src={thumbnailImage}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover border border-gray-200 rounded-md"
              />
              <button
                type="button"
                onClick={() => setThumbnailImage(null)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                title="Remove"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            {...register('category')}
          >
            <option value="">Select a category</option>
            <option value="NGO">NGO</option>
            <option value="Religious">Religious</option>
            <option value="Institute">Institute</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="isPublic"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...register('isPublic')}
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this fundraiser public
          </label>
        </div>
        
        {submitError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => reset()}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Fundraiser'}
          </button>
        </div>
      </form>
    </div>
  );
} 