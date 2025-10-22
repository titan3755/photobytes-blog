import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '403 Forbidden | PhotoBytes Studios',
  description: 'You do not have permission to access this page.',
};

export default function Forbidden() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-white px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-yellow-600 drop-shadow-lg">
          403
        </h1>
        <p className="mt-4 text-2xl font-semibold text-yellow-700">
          Access Denied
        </p>
        <p className="mt-2 text-yellow-500">
          Sorry, you do not have permission to access this page.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-yellow-600 text-white text-lg font-medium rounded-xl shadow hover:bg-yellow-700 transition"
          >
            ← Back to PhotoBytes Blog
          </Link>
        </div>
      </div>
    </main>
  );
}