'use client';

import {
  BloggerApplication,
  // User, // This import is unused
  ApplicationStatus,
} from '@prisma/client';
import Link from 'next/link';

// 1. Export the type so other components can use it
export type ApplicationWithUser = BloggerApplication & {
  user: {
    name: string | null;
    email: string | null;
    username: string | null;
  } | null;
};

interface ModalProps {
  application: ApplicationWithUser;
  onClose: () => void; // 2. FIX: Changed () to () => void
}

// Helper for status badges (copied from admin page)
function StatusBadge({ status }: { status: ApplicationStatus }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  if (status === ApplicationStatus.PENDING) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  return (
    <span
      className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
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
      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      {/* Add whitespace-pre-wrap to respect newlines in the text */}
      <p className="mt-1 text-md text-gray-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export default function BloggerApplicationModal({
  application,
  onClose,
}: ModalProps) {
  // Prevent clicks on the modal content from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // Full-screen overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Close when clicking the overlay
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={handleModalClick} // Stop propagation
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Application Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Applicant:{' '}
              {application.user?.name || application.user?.username || 'N/A'}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <DetailRow label="Email" value={application.user?.email} />
          <DetailRow
            label="Why they want to be a blogger"
            value={application.reason}
          />
          <DetailRow
            label="Topics they want to write about"
            value={application.topics}
          />
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Sample Work URL
            </h4>
            {application.sampleUrl ? (
              <Link
                href={application.sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-md text-blue-600 hover:underline break-words"
              >
                {application.sampleUrl}
              </Link>
            ) : (
              <p className="mt-1 text-md text-gray-500 italic">
                No sample provided
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}