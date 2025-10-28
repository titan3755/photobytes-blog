'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

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

export default function Login() {
  // Use a single state for email OR username
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For registration success
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query params

  // Check for registration success message
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in.');
      // Optional: remove the query param from URL without reloading
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // Clear success message on new attempt
    setIsLoading(true);

    try {
      // Determine if input is email or username
      const isEmail = loginId.includes('@');

      const result = await signIn('credentials', {
        redirect: false, // Handle redirect manually
        // Send either email or username based on input
        email: isEmail ? loginId : undefined,
        username: !isEmail ? loginId : undefined,
        password,
      });

      if (result?.error) {
        // More specific error messages could be handled here if needed
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        // On successful login, redirect to the dashboard
        router.push('/dashboard');
        router.refresh(); // Refresh server components
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.' + e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    // Redirect to dashboard after successful social login
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    // Use the main page background from layout
    <div className="min-h-screen min-w-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center mb-6">
          Login to your Account
        </h1>

        {error && <p className="text-center text-red-500 dark:text-red-400 mb-4">{error}</p>}
        {successMessage && (
          <p className="text-center text-green-600 dark:text-green-400 mb-4">{successMessage}</p>
        )}

        {/* Social Logins */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            <span className="font-medium">Continue with Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FacebookIcon />
            <span className="font-medium">Continue with Facebook</span>
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-3 text-sm text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Combined Email/Username Field */}
          <div>
            <label htmlFor="loginId" className="sr-only">Email or Username</label>
            <input
              id="loginId"
              type="text"
              placeholder="Email or Username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
            />
          </div>
          <div>
            <label htmlFor="password_login" className="sr-only">Password</label>
            <input
              id="password_login" // Changed id to be unique from register page
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className={`font-medium text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 ${
              isLoading ? 'pointer-events-none' : ''
            }`}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}