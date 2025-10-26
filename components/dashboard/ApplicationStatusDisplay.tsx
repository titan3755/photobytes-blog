import { ApplicationStatus } from '@prisma/client';
import Link from 'next/link';

// Helper for status badges in dashboard
export default function ApplicationStatusDisplay({ status }: { status: ApplicationStatus }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let darkBgColor = 'dark:bg-gray-700';
  let darkTextColor = 'dark:text-gray-200';
  let message = 'Your application status: ';

  if (status === ApplicationStatus.PENDING) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    darkBgColor = 'dark:bg-yellow-900';
    darkTextColor = 'dark:text-yellow-300';
    message = 'Your blogger application is currently pending review.';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    darkBgColor = 'dark:bg-green-900';
    darkTextColor = 'dark:text-green-300';
    message = 'Congratulations! Your blogger application has been approved.';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    darkBgColor = 'dark:bg-red-900';
    darkTextColor = 'dark:text-red-300';
    message =
      'Your blogger application was reviewed but not approved at this time.';
  }

  return (
    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <p className="text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor} ${darkBgColor} ${darkTextColor}`}
      >
        {status}
      </span>
      {status === ApplicationStatus.REJECTED && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Please contact support if you have questions.
        </p>
      )}
       {/* Added this link for consistency with your other pages */}
      {status !== ApplicationStatus.PENDING && (
         <p className="mt-6">
           <Link
             href="/dashboard"
             className="text-blue-600 dark:text-blue-400 hover:underline"
           >
             &larr; Back to Dashboard
           </Link>
         </p>
      )}
    </div>
  );
}

