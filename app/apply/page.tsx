'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [topics, setTopics] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState('');

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session, status, isAuthenticated]);

  // Redirect if not logged in (middleware should handle this, but good practice)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/apply');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmitMessage('You must be logged in to apply.');
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
        // Send pre-filled name/email along with form data
        body: JSON.stringify({ name, email, reason, topics, sampleUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      setSubmitStatus('success');
      setSubmitMessage('Application submitted successfully! We will review it soon.');
      // Optionally clear fields or redirect
      // setReason('');
      // setTopics('');
      // setSampleUrl('');
      // router.push('/dashboard');
    } catch (err: any) {
      console.error('Application submission error:', err);
      setSubmitStatus('error');
      setSubmitMessage(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render form until session is loaded and authenticated
  if (status === 'loading') {
    return (
       <div className="min-h-screen flex items-center justify-center">
         <p className="text-gray-500">Loading...</p>
      </div>
     );
  }

  // If somehow unauthenticated user reaches here (e.g., race condition)
   if (!isAuthenticated) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <p className="text-red-500">Please log in to apply.</p>
         <Link href="/login?callbackUrl=/apply" className="ml-2 text-blue-600 hover:underline">Login</Link>
       </div>
     );
   }


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Apply to be a Blogger
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Share your expertise with the PhotoBytes community! Fill out the
            form below to apply.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Pre-filled Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                readOnly // Cannot change
                className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 bg-gray-100 cursor-not-allowed text-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly // Cannot change
                className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 bg-gray-100 cursor-not-allowed text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Application Questions */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="Tell us about your interest and motivation..."
            />
          </div>

          <div>
            <label
              htmlFor="topics"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Photography techniques, web development tutorials, tech reviews..."
            />
          </div>

          <div>
            <label
              htmlFor="sampleUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Link to Sample Work (Optional)
            </label>
            <input
              id="sampleUrl"
              type="url"
              value={sampleUrl}
              onChange={(e) => setSampleUrl(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Your personal blog, portfolio, GitHub..."
            />
             <p className="mt-1 text-xs text-gray-500">
               Provide a link to your previous writing or relevant projects if available.
             </p>
          </div>

          {/* Submission Button and Status */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'} // Disable after successful submission too
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {submitMessage && (
            <p
              className={`text-center text-sm font-medium ${
                submitStatus === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {submitMessage}
            </p>
          )}
          {submitStatus === 'success' && (
             <p className="text-center text-sm text-gray-600">
               You can now return to your{' '}
               <Link href="/dashboard" className="text-blue-600 hover:underline">
                 Dashboard
               </Link>.
             </p>
          )}
        </form>
      </div>
    </div>
  );
}