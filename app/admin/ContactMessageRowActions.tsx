'use client';

import { useState, useTransition } from 'react';
import {
  markContactMessageRead,
  deleteContactMessage,
} from './actions'; // Import the new actions

export default function ContactMessageRowActions({
  messageId,
  isRead,
}: {
  messageId: string;
  isRead: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleMarkRead = async () => {
    setError(null);
    startTransition(async () => {
      const result = await markContactMessageRead(messageId, !isRead); // Toggle read status
      if (!result.success) {
        setError(result.message || 'Failed to update status.');
      }
    });
  };

  const handleDelete = async () => {
     if (!window.confirm('Are you sure you want to delete this message?')) {
        return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteContactMessage(messageId);
      if (!result.success) {
        setError(result.message || 'Failed to delete message.');
      }
      // No need to handle success UI, revalidatePath does it
    });
  };

  return (
    <div className="space-x-2">
      <button
        onClick={handleMarkRead}
        disabled={isPending}
        className={`px-2 py-1 text-xs rounded ${
          isRead
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-green-500 text-white hover:bg-green-600'
        } disabled:opacity-50`}
      >
        {isPending ? '...' : isRead ? 'Mark Unread' : 'Mark Read'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {isPending ? '...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}