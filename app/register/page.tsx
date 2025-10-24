'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// You can use simple SVG icons for the buttons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.59,4.73 17.9,7.1 17.9,7.1L20.27,4.73C20.27,4.73 17.64,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.73 21.35,11.1 21.35,11.1V11.1Z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);


export default function Register() {
  const [name, setName] = useState(''); // <-- Add state for name
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Name is optional, but email, username, password are required
    if (!email || !username || !password) {
      setError('Please fill in Email, Username, and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || undefined, // Send name (trimmed) or undefined if empty
          email,
          username,
          password,
        }),
      });

      if (res.ok) {
        router.push('/login?registered=true'); // Redirect to login, maybe add a success message indicator
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    // Redirect to dashboard after social sign-up
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl text-black font-bold text-center mb-6">
          Register
        </h1>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {/* Social Sign-ups */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <GoogleIcon />
            {isLoading ? 'Loading...' : 'Sign up with Google'}
          </button>
          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FacebookIcon />
            {isLoading ? 'Loading...' : 'Sign up with Facebook'}
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Added Name Field (Optional) */}
          <input
            type="text"
            placeholder="Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Updated border color
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Updated border color
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Updated border color
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" // Updated border color
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed" // Changed to blue
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link
            href="/login"
            className={`font-medium text-blue-600 hover:underline ${
              isLoading ? 'pointer-events-none' : ''
            }`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
