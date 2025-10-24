'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import { useEffect } from 'react'; // Import useEffect

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
        console.error('Login Error:', result.error);
      } else if (result?.ok) {
        // On successful login, redirect to the dashboard
        router.push('/dashboard');
        router.refresh(); // Refresh server components
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login failed:', error);
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
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl text-black font-bold text-center mb-6">Login</h1>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {successMessage && (
          <p className="text-center text-green-600 mb-4">{successMessage}</p>
        )}

        {/* Social Logins - Styled like register page */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {isLoading ? 'Loading...' : 'Continue with Google'}
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FacebookIcon />
            {isLoading ? 'Loading...' : 'Continue with Facebook'}
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Combined Email/Username Field */}
          <input
            type="text" // Changed type to text
            placeholder="Email or Username" // Updated placeholder
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Matched border
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Matched border
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed" // Matched button color
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className={`font-medium text-blue-600 hover:underline ${
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