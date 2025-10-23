'use client';

import { useState } from 'react';
// import type { Metadata } from 'next'; // Removed this

// Removed the metadata export
// export const metadata: Metadata = {
//   title: 'Contact Us | PhotoBytes Blog',
//   description: 'Get in touch with PhotoBytes Studios.',
// };

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // For submit status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');

    // ---
    // NOTE: This is where you would send the data to your backend API route
    // For now, we'll just log it and show a success message.
    // ---
    console.log({ name, email, message });

    // Simulate an API call
    setTimeout(() => {
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Have a question, feedback, or a project idea? We'd love to hear from
            you.
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white"
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white"
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          </div>

          {status && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}