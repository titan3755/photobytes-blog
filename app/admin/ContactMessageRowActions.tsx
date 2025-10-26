'use client';

import { useState, useTransition } from 'react';
import { markContactMessageRead, deleteContactMessage } from './actions';
import type { ContactMessage } from '@prisma/client';
import ContactMessageModal from './ContactMessageModal';

export default function ContactMessageRowActions({
  message,
}: {
  message: ContactMessage;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkRead = async () => {
    setError(null);
    startTransition(async () => {
      const result = await markContactMessageRead(message.id, !message.isRead);
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
      const result = await deleteContactMessage(message.id);
      if (!result.success) {
        setError(result.message || 'Failed to delete message.');
      }
    });
  };

  return (
    <>
      <div className="space-x-2">
         <button
          onClick={() => setIsModalOpen(true)}
          disabled={isPending}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50"
        >
          View
        </button>

        <button
          onClick={handleMarkRead}
          disabled={isPending}
          className={`px-2 py-1 text-xs rounded ${
            message.isRead
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
              : 'bg-green-500 text-white hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {isPending ? '...' : message.isRead ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? '...' : 'Delete'}
        </button>
      </div>
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 text-right">{error}</p>}

      {isModalOpen && (
        <ContactMessageModal
          message={message}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}