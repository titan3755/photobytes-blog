'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createOrder } from './actions';
import { DollarSign, Calendar, Facebook } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Place an Order | PhotoBytes Blog',
  description: 'Place a custom order for photography, videography, web development, and more with PhotoBytes.',
};

const workCategories = [
  "Photography (Event)",
  "Photography (Product)",
  "Videography (Event)",
  "Web Development (Full Stack)",
  "Web Development (Frontend)",
  "Graphic Design (Logo)",
  "Graphic Design (General)",
  "Other (Please describe)",
];

export default function OrderPage() {
  const { status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const isLoadingSession = status === 'loading';

  // Form State
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  // Submission State
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/order');
    }
  }, [status, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!executeRecaptcha) {
      setError("reCAPTCHA not loaded. Please try refreshing the page.");
      return;
    }

    if (!category || !description) {
      setError('Please select a category and provide a description.');
      return;
    }

    startTransition(async () => {
      let token: string;
      try {
        token = await executeRecaptcha('order');
      } catch (e) {
        setError("Failed to get reCAPTCHA token. Please try again." + e);
        return;
      }
      const result = await createOrder({
        category,
        description,
        budget: budget || null,
        deadline: deadline || null,
        recaptchaToken: token,
      });

      if (!result.success) {
        setError(result.message || 'Failed to submit order.');
      } else {
        setSuccess(result.message || 'Order submitted!');
        // Clear form
        setCategory('');
        setDescription('');
        setBudget('');
        setDeadline('');
      }
    });
  };

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="min-h-screen w-full p-8 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading session...
        </p>
      </div>
    );
  }

  // This check ensures we only render for authenticated users
  if (!isAuthenticated) {
    return null; // or a more robust loading/redirecting state
  }

  return (
    <div className="min-h-screen w-full p-8 flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">
            Place an Order
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Let us know what you need. Fill out the form below or contact us directly.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-12">
          {/* --- Left Column: Order Form --- */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                New Project Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Select */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Work Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={isPending}
                    className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-50"
                  >
                    <option value="" disabled>Select a category...</option>
                    {workCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isPending}
                    className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-50"
                    placeholder="Please describe your project, including key requirements, goals, and any specific details..."
                  />
                </div>
                
                {/* Budget (Optional) */}
                <div>
                  <label
                    htmlFor="budget"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Budget (Optional)
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="budget"
                      name="budget"
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      disabled={isPending}
                      className="block w-full pl-10 px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-50"
                      placeholder="e.g., $500 - $1000"
                    />
                  </div>
                </div>

                {/* Deadline (Optional) */}
                <div>
                  <label
                    htmlFor="deadline"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Deadline (Optional)
                  </label>
                  <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="deadline"
                      name="deadline"
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      disabled={isPending}
                      className="block w-full pl-10 px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-50"
                      placeholder="e.g., 2-3 weeks, End of month"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isPending ? 'Submitting...' : 'Submit Order'}
                  </button>
                </div>

                {success && (
                  <p className="text-center text-sm text-green-600 dark:text-green-400">{success}</p>
                )}
                {error && (
                  <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </form>
            </div>
          </div>
          
          {/* --- Right Column: Direct Order --- */}
          <div className="lg:col-span-2 mt-10 lg:mt-0">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Directly
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Prefer to discuss your project in real-time? You can also place an order by sending us a direct message on our Facebook page.
                </p>
                 <a
                    href="https://www.facebook.com/PhotoBytes999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    Message on Facebook
                  </a>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
