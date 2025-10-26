'use client';

import { useState, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { deleteOwnAccount } from './actions';
import Link from 'next/link';

export default function ProfileActions() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnAccount();
      if (!result.success) {
        setError(result.message || 'Failed to delete account.');
        setIsModalOpen(false); // Close modal to show error
      } else {
        // On success, sign the user out completely
        await signOut({ callbackUrl: '/' });
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-end gap-4 mt-6">
        <Link
          href="/profile/edit"
          className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Edit Profile
        </Link>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Delete Account
        </button>
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-4 text-right">{error}</p>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Are you absolutely sure?
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone. This will permanently delete your
                account, all of your articles, and all of your comments.
              </p>
            </div>
            <div className="flex justify-end gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
