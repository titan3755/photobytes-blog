'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, Phone, MapPin } from 'lucide-react'; // Import icons
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | PhotoBytes Blog',
  description: 'Get in touch with the PhotoBytes Blog team for inquiries, support, or feedback.',
};

export default function ContactPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added for submit button
  const { executeRecaptcha } = useGoogleReCaptcha();

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
    setError('');
    if (!executeRecaptcha) {
      setError("reCAPTCHA not loaded. Please try refreshing.");
      return;
    }
    setFormStatus('Submitting...');
    setIsLoading(true); // Set loading

    try {
      const token = await executeRecaptcha('contact');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message, recaptchaToken: token }),
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
    } catch {
      setFormStatus('');
      setError('Failed to send message. Please try again.');
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
                +88 01931-178236
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