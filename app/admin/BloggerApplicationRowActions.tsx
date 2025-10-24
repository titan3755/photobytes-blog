'use client';

import { useState, useTransition } from 'react';
import { ApplicationStatus } from '@prisma/client';
import {
  approveBloggerApplication,
  rejectBloggerApplication,
} from './actions'; // Import the new actions

export default function BloggerApplicationRowActions({
  applicationId,
  userId,
  currentStatus,
}: {
  applicationId: string;
  userId: string;
  currentStatus: ApplicationStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    if (
      !window.confirm(
        'Are you sure you want to approve this application and make this user a Blogger?'
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await approveBloggerApplication(applicationId, userId);
      if (!result.success) {
        setError(result.message || 'Failed to approve application.');
      }
    });
  };

  const handleReject = () => {
    if (
      !window.confirm('Are you sure you want to reject this application?')
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectBloggerApplication(applicationId);
      if (!result.success) {
        setError(result.message || 'Failed to reject application.');
      }
    });
  };

  // Only show actions if the application is PENDING
  if (currentStatus !== ApplicationStatus.PENDING) {
    return (
       <span className="text-xs text-gray-500 italic">
        {currentStatus === ApplicationStatus.APPROVED ? 'Approved' : 'Rejected'}
       </span>
    );
  }

  return (
    <div className="space-x-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isPending ? '...' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {isPending ? '...' : 'Reject'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}