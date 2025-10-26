'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { markNotificationAsRead } from '@/app/admin/actions'; // Import the action
import type { UserNotification, Notification } from '@prisma/client';

// Define the type for the props
type FullNotification = UserNotification & {
  notification: Notification;
};

interface NotificationItemProps {
  item: FullNotification;
}

// A simple icon for notifications
function NotificationIcon() {
  return (
    <svg
      className="h-6 w-6 text-blue-500 dark:text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export default function NotificationItem({ item }: NotificationItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMarkAsRead = () => {
    // Don't run if already read or pending
    if (item.isRead || isPending) return;

    startTransition(async () => {
      await markNotificationAsRead(item.id);
      // The action revalidates the path, but router.refresh() ensures
      // the client-side UI updates promptly without a full page reload.
      router.refresh();
    });
  };

  // Helper to render the main content
  const renderContent = () => (
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {item.notification.title}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {item.notification.description}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {new Date(item.notification.createdAt).toLocaleString()}
      </p>
    </div>
  );

  return (
    <li
      className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
        item.isRead
          ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' // Read state
          : 'bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-600' // Unread state
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="flex-shrink-0 mt-1">
        <NotificationIcon />
      </div>

      {/* If notification has a URL, wrap content in a Link */}
      {item.notification.url ? (
        <Link
          href={item.notification.url}
          className="flex-1"
          onClick={handleMarkAsRead} // Mark as read when clicked
        >
          {renderContent()}
        </Link>
      ) : (
        // Otherwise, just make the div clickable
        <div
          className="flex-1 cursor-pointer"
          onClick={handleMarkAsRead}
        >
          {renderContent()}
        </div>
      )}

      {/* "Mark as Read" dot/button */}
      {!item.isRead && (
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={handleMarkAsRead}
            disabled={isPending}
            title="Mark as read"
            className="w-3 h-3 bg-blue-500 rounded-full hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-300 focus:outline-none"
          />
        </div>
      )}
    </li>
  );
}