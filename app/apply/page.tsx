'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApplicationStatus, Role } from '@prisma/client'; // Import Role

// Helper component to display status (similar to dashboard)
function ApplicationStatusDisplay({ status }: { status: ApplicationStatus }) {
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
    message =
      'Your application is currently pending review. We will notify you once a decision is made.';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    darkBgColor = 'dark:bg-green-900';
    darkTextColor = 'dark:text-green-300';
    message =
      'Congratulations! Your blogger application has been approved. You can now start creating articles from your dashboard.';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    darkBgColor = 'dark:bg-red-900';
    darkTextColor = 'dark:text-red-300';
    message =
      'Your application was reviewed but not approved at this time.';
  }

  return (
    <div className="text-center p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">{message}</p>
      <span
        className={`px-4 py-1.5 text-md font-semibold rounded-full ${bgColor} ${textColor} ${darkBgColor} ${darkTextColor}`}
      >
        {status}
      </span>
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

// New component for Admins/Bloggers
function AlreadyBloggerOrAdminDisplay({ role }: { role: Role }) {
  const roleName = role === Role.ADMIN ? 'Admin' : 'Blogger';
  return (
    <div className="text-center p-6 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
      <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
        As an <strong className="font-semibold">{roleName}</strong>, you already
        have publishing privileges.
      </p>
      <p className="mt-6">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

export default function ApplyPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const isAuthenticated = sessionStatus === 'authenticated';
  const userRole = session?.user?.role; // Get user role

  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [topics, setTopics] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch application status when session is ready (only for USER role)
  useEffect(() => {
    if (
      isAuthenticated &&
      session?.user?.id &&
      userRole === Role.USER &&
      isLoadingStatus
    ) {
      // Fetch status only if the user is a standard USER
      fetch('/api/apply/status')
        .then((res) => {
          if (res.status === 404) return null;
          if (!res.ok) throw new Error('Failed to fetch status');
          return res.json();
        })
        .then((data) => {
          setApplicationStatus(data?.status || null);
        })
        .catch((err) => {
          console.error('Failed to fetch application status:', err);
        })
        .finally(() => setIsLoadingStatus(false));

      setName(session.user.name || '');
      setEmail(session.user.email || '');
    } else if (
      isAuthenticated &&
      (userRole === Role.ADMIN || userRole === Role.BLOGGER)
    ) {
      // If Admin or Blogger, stop loading, no need to fetch status
      setIsLoadingStatus(false);
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/apply');
    } else if (sessionStatus !== 'loading' && !isLoadingStatus) {
      setIsLoadingStatus(false);
    }
  }, [session, sessionStatus, isAuthenticated, router, isLoadingStatus, userRole]); // Added userRole

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitMessage('You must be logged in to apply.');
      setSubmitStatus('error');
      return;
    }
    // Prevent Admins/Bloggers from submitting via form manipulation
    if (userRole !== Role.USER) {
      setSubmitMessage('Your role already has blogging privileges.');
      setSubmitStatus('error');
      return;
    }
    if (!reason || !topics) {
      setSubmitMessage('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, reason, topics, sampleUrl }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'Something went wrong');

      setSubmitStatus('success');
      setSubmitMessage(
        'Application submitted successfully! We will review it soon.'
      );
      setApplicationStatus(ApplicationStatus.PENDING);
    } catch (err: any) {
      console.error('Application submission error:', err);
      setSubmitStatus('error');
      setSubmitMessage(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Combined Loading / Unauthenticated Check ---
  if (sessionStatus === 'loading' || isLoadingStatus) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg animate-pulse">
            Loading application status...
          </p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full text-center">
          <p className="text-red-500 dark:text-red-400">Please log in to apply.</p>
          <Link
            href="/login?callbackUrl=/apply"
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // --- Render based on application status OR user role ---
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        {userRole === Role.ADMIN || userRole === Role.BLOGGER ? (
          // If user is already Admin or Blogger, show message
          <AlreadyBloggerOrAdminDisplay role={userRole} />
        ) : applicationStatus ? (
          // If USER has an application, show status
          <ApplicationStatusDisplay status={applicationStatus} />
        ) : (
          // If USER has no application, show the form
          <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                Apply to be a Blogger
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Share your expertise with the PhotoBytes community! Fill out the
                form below to apply.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    readOnly
                    className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Why do you want to be a blogger for PhotoBytes?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  placeholder="Tell us about your interest and motivation..."
                />
              </div>
              <div>
                <label
                  htmlFor="topics"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  What topics would you like to write about?{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="topics"
                  rows={4}
                  required
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Photography techniques, web development tutorials, tech reviews..."
                />
              </div>
              <div>
                <label
                  htmlFor="sampleUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Link to Sample Work (Optional)
                </label>
                <input
                  id="sampleUrl"
                  type="url"
                  value={sampleUrl}
                  onChange={(e) => setSampleUrl(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Your personal blog, portfolio, GitHub..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Provide a link to your previous writing or relevant projects
                  if available.
                </p>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
              {submitMessage && (
                <p
                  className={`text-center text-sm font-medium ${
                    submitStatus === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {submitMessage}
                </p>
              )}
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Changed your mind?{' '}
              <Link
                href="/dashboard"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Go back to Dashboard
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}