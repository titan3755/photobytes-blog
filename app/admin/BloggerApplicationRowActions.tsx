'use client';

import { useState, useTransition } from 'react';
import { ApplicationStatus } from '@prisma/client';
import {
  approveBloggerApplication,
  rejectBloggerApplication,
} from './actions';
import BloggerApplicationModal from './BloggerApplicationModal';
import type { ApplicationWithUser } from './BloggerApplicationModal';

export default function BloggerApplicationRowActions({
  application,
}: {
  application: ApplicationWithUser;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const result = await approveBloggerApplication(
        application.id,
        application.userId
      );
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
      const result = await rejectBloggerApplication(application.id);
      if (!result.success) {
        setError(result.message || 'Failed to reject application.');
      }
    });
  };

  return (
    <>
      <div className="flex items-center space-x-2 justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          View Details
        </button>

        {application.status === ApplicationStatus.PENDING && (
          <>
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
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-1 text-right">{error}</p>
      )}

      {isModalOpen && (
        <BloggerApplicationModal
          application={application}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}