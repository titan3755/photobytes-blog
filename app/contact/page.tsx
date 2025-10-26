'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react'; // Import icons

// --- START: Added Icon Definitions ---
// Copied GoogleIcon from register page
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.59,4.73 17.9,7.1 17.9,7.1L20.27,4.73C20.27,4.73 17.64,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.73 21.35,11.1 21.35,11.1V11.1Z"
    />
  </svg>
);

// Copied FacebookIcon from register page
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);
// --- END: Added Icon Definitions ---


export default function ContactPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added for submit button

  useEffect(() => {
    if (isAuthenticated && session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    } else if (status === 'unauthenticated') {
      setName('');
      setEmail('');
    }
  }, [session, status, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('Submitting...');
    setError('');
    setIsLoading(true); // Set loading

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      setFormStatus('Message sent successfully! We will get back to you soon...');
      setMessage('');
      if (!isAuthenticated) {
        setName('');
        setEmail('');
      }
    } catch (err: any) {
      setFormStatus('');
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false); // Unset loading
    }
  };

  return (
    // Page container inherits bg from layout
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-h-screen min-w-screen">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-5 lg:gap-12 items-start">
        
        {/* --- Left Column: Contact Info --- */}
        <div className="lg:col-span-2 mb-12 lg:mb-0">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Have a question, feedback, or a project idea? We&apos;d love to hear
            from you. Fill out the form, or reach out to us directly.
          </p>
          
          <dl className="mt-10 space-y-6 text-base text-gray-600 dark:text-gray-300">
            {/* Email */}
            <div className="flex gap-4">
              <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <dd>
                <a href="mailto:info.photobytes@gmail.com" className="hover:text-gray-900 dark:hover:text-white">
                  info.photobytes@gmail.com
                </a>
              </dd>
            </div>
             {/* Phone (Placeholder) */}
            <div className="flex gap-4">
              <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <dd>
                +1 (555) 123-4567
              </dd>
            </div>
             {/* Address (Placeholder) */}
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <dd>
                Dhaka, Bangladesh
              </dd>
            </div>
          </dl>
        </div>

        {/* --- Right Column: Contact Form --- */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isAuthenticated || isLoading} // Disable if logged in or loading
                    className={`block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 dark:text-white ${
                      isAuthenticated
                        ? 'bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                        : 'dark:bg-gray-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAuthenticated || isLoading} // Disable if logged in or loading
                    className={`block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 dark:text-white ${
                      isAuthenticated
                        ? 'bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                        : 'dark:bg-gray-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                    className="block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-50 dark:disabled:bg-gray-600"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>

              {formStatus && formStatus !== 'Submitting...' && (
                <p className="text-center text-sm text-green-600 dark:text-green-400">{formStatus}</p>
              )}
              {error && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}