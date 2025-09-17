"use client"

import Link from "next/link"
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Error | PhotoBytes Studios',
  description: 'An unexpected error occurred.',
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-white px-6">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-red-600 drop-shadow-lg">
            Application Error
          </h1>
          <p className="mt-4 text-xl font-semibold text-red-700">
            Something went wrong while loading the app.
          </p>
          {error?.digest && (
            <p className="mt-2 text-sm text-red-500">
              Error ID: {error.digest}
            </p>
          )}
          <p className="mt-2 text-red-500">
            Please try again or return to the homepage.
          </p>

            <div className="mt-8 flex justify-center align-middle space-x-4">
                <button
                    onClick={reset}
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-xl shadow hover:bg-red-700 transition"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white text-lg font-medium rounded-xl shadow hover:bg-gray-900 transition"
                >
                    Go Home
                </Link>
            </div>
        </div>
      </body>
    </html>
  )
}
