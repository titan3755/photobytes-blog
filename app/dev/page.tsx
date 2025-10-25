'use client'; // 1. Convert to client component

import { useSession } from 'next-auth/react'; // 2. Import hooks
import { useState, useTransition } from 'react';
import { testDevAction } from './actions'; // 3. Import server action
import Link from 'next/link';

export default function Dev() {
  const { data: session, status } = useSession(); // 4. Get session
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 5. Wrapper for the server action
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await testDevAction(formData);
      setActionResult(result);
    });
  };

  return (
    // 6. Apply your UI workaround classes
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Developer Page</h1>
          <p className="mt-2 text-lg text-gray-600">
            Unfinished and experimental features will be tested here.
          </p>
        </div>

        {/* Session Viewer */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Session State
          </h2>
          {status === 'loading' && (
            <p className="text-gray-500 animate-pulse">Loading session...</p>
          )}
          {status === 'unauthenticated' && (
            <p className="text-red-500">
              Not authenticated.{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          )}
          {status === 'authenticated' && (
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto text-black">
              {JSON.stringify(session, null, 2)}
            </pre>
          )}
        </div>

        {/* Server Action Tester */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Server Action Test (Admin Only)
          </h2>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Test Message:
              </label>
              <input
                type="text"
                name="message"
                id="message"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black"
                placeholder="Type something..."
              />
            </div>
            <button
              type="submit"
              disabled={
                isPending ||
                status !== 'authenticated' ||
                session?.user?.role !== 'ADMIN'
              }
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Testing...' : 'Run Test Action'}
            </button>
            {actionResult && (
              <p
                className={`mt-2 text-sm ${
                  actionResult.success ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {actionResult.message}
              </p>
            )}
            {status === 'authenticated' &&
              session?.user?.role !== 'ADMIN' && (
                <p className="text-yellow-600 text-sm">
                  You must be an Admin to run this test action.
                </p>
              )}
          </form>
        </div>
      </div>
    </div>
  );
}
