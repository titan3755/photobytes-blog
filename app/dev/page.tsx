'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { testDevAction } from './actions';
import { useTheme } from 'next-themes'; // For theme toggle test
import { Moon, Sun } from 'lucide-react'; // For theme icons
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar'; // For component test
import NotificationItem from '@/components/dashboard/NotificationItem'; // For component test
import { Role, type UserNotification, type Notification } from '@prisma/client'; // For types

// Mock data for notification test
const mockNotification: UserNotification & { notification: Notification } = {
  id: 'notif-1',
  userId: 'user-1',
  notificationId: 'n-1',
  isRead: false,
  notification: {
    id: 'n-1',
    title: 'Test Notification',
    description: 'This is a test to see how notifications render.',
    url: '/dashboard',
    createdAt: new Date(),
  },
};

export default function Dev() {
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // --- Theme Toggle Logic ---
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);
  // --- End Theme Logic ---

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await testDevAction(formData);
      setActionResult(result);
    });
  };

  return (
    // Applied workaround classes with dark mode
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Developer Page
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Unfinished and experimental features will be tested here.
          </p>
        </div>

        {/* Session Viewer */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Session State
          </h2>
          {status === 'loading' && (
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading session...</p>
          )}
          {status === 'unauthenticated' && (
            <p className="text-red-500 dark:text-red-400">
              Not authenticated.{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Login
              </Link>
            </p>
          )}
          {status === 'authenticated' && (
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-black dark:text-gray-200">
              {JSON.stringify(session, null, 2)}
            </pre>
          )}
        </div>

        {/* --- New Section: Component Playground --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Component Playground
          </h2>
          <div className="space-y-4">
            {/* Theme Toggle Test */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Theme Toggle</h3>
              {mounted ? (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span>Toggle to {theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              ) : (
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              )}
            </div>
            {/* Avatar Test */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Avatar Test</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {/* --- START FIX: Pass props individually --- */}
                <UserProfileAvatar name="Test User" src="https://lh3.googleusercontent.com/a/ACg8ocLUourhwM6p9ejarQFYRaEvfKhAs1a9VDew8SXq_dPIiF4BbCls=s96-c" alt="Test User" />
                <UserProfileAvatar name="Ayo" src={null} alt="Ayo" />
                <UserProfileAvatar name="Jane Doe" src={null} alt="Jane Doe" />
                {/* --- END FIX --- */}
              </div>
            </div>
          </div>
        </div>

         {/* --- New Section: Notification Tester --- */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Notification Test
          </h2>
          <ul className="space-y-3">
            <NotificationItem item={mockNotification} />
            <NotificationItem item={{ ...mockNotification, id: 'notif-2', isRead: true, notification: { ...mockNotification.notification, title: "A Read Notification" } }} />
          </ul>
         </div>


        {/* Server Action Tester */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Server Action Test (Admin Only)
          </h2>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Test Message:
              </label>
              <input
                type="text"
                name="message"
                id="message"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black"
                placeholder="Type something..."
              />
            </div>
            <button
              type="submit"
              disabled={
                isPending ||
                status !== 'authenticated' ||
                session?.user?.role !== Role.ADMIN // Use Enum for safety
              }
              className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {isPending ? 'Testing...' : 'Run Test Action'}
            </button>
            {actionResult && (
              <p
                className={`mt-2 text-sm ${
                  actionResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {actionResult.message}
              </p>
            )}
            {status === 'authenticated' &&
              session?.user?.role !== Role.ADMIN && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  You must be an Admin to run this test action.
                </p>
              )}
          </form>
        </div>
      </div>
    </div>
  );
}