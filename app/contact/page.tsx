'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    setError('');

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

      setStatus('Message sent successfully! We will get back to you soon...');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact form error:', err);
      setStatus('');
      setError(err.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen min-w-screen bg-gray-50 flex flex-col items-center justify-center ">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Have a question, feedback, or a project idea? We&apos;d love to hear
            from you.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" // Added border
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" // Added border
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
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
                className="block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" // Added border
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'Submitting...'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {status === 'Submitting...' ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          {status && status !== 'Submitting...' && (
            <p className="text-center text-sm text-green-600">{status}</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}