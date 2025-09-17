import type { Metadata } from 'next';
import Link from "next/link"

export const metadata: Metadata = {
  title: '404 Not Found | PhotoBytes Studios',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-white px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-red-600 drop-shadow-lg">404</h1>
        <p className="mt-4 text-2xl font-semibold text-red-700">
          Page Not Found
        </p>
        <p className="mt-2 text-red-500">
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-xl shadow hover:bg-red-700 transition"
          >
            ← Back to PhotoBytes Blog
          </Link>
        </div>
      </div>
    </main>
  )
}
