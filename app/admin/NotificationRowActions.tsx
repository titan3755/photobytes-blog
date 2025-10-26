'use client';

import { useState, useTransition } from 'react';
import { deleteNotification } from './actions';

export default function NotificationRowActions({
  notificationId,
  notificationTitle,
}: {
  notificationId: string;
  notificationTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the notification "${notificationTitle}"? This will remove it for all users who received it.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteNotification(notificationId);
      if (!result.success) {
        setError(result.message || 'Failed to delete notification.');
      }
    });
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
        title="Delete Notification"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}