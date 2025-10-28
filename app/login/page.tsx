import { Suspense } from 'react';
import LoginForm from './LoginForm';

// This is a simple Server Component.
// It wraps the Client Component in a Suspense boundary,
// which is required for useSearchParams() to work.
export default function LoginPage() {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// A simple loading spinner to show while the form loads
function LoadingSpinner() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mx-auto"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
      </div>
    </div>
  );
}

