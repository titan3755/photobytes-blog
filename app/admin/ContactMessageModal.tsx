'use client';

import { ContactMessage } from '@prisma/client';
import Link from 'next/link';

interface ModalProps {
  message: ContactMessage;
  onClose: () => void;
}

// Reusable detail row
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
      <p className="mt-1 text-md text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export default function ContactMessageModal({
  message,
  onClose,
}: ModalProps) {
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Contact Message
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              From: {message.name}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              message.isRead
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {message.isRead ? 'Read' : 'Unread'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <DetailRow label="Sender's Email" value={message.email} />
          <DetailRow label="Received" value={new Date(message.createdAt).toLocaleString()} />
          <DetailRow label="Sender's IP" value={message.ipAddress} />
          <DetailRow label="Full Message" value={message.message} />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gray-50 dark:bg-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}