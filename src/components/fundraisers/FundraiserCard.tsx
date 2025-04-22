"use client";

import Link from 'next/link';
import Image from 'next/image';
import { IFundraiser } from '@/models/Fundraiser';

interface FundraiserCardProps {
  fundraiser: IFundraiser;
}

export default function FundraiserCard({ fundraiser }: FundraiserCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="h-48 w-full relative">
        {fundraiser.thumbnailImage ? (
          <Image
            src={fundraiser.thumbnailImage}
            alt={fundraiser.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-indigo-100">
            <span className="text-xl font-bold text-indigo-500">
              {fundraiser.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="inline-block rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
            {fundraiser.category}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
          {fundraiser.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {fundraiser.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
          {fundraiser.targetAmount ? (
            <span className="text-sm text-gray-600">
              Target: ₹{fundraiser.targetAmount.toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-gray-600">No target amount</span>
          )}
          <Link
            href={`/fundraisers/${fundraiser._id}`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
} 