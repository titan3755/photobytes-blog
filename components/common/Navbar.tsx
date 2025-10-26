'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Role } from '@prisma/client';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

// --- Helper component for Avatar ---
function getInitials(name?: string | null): string {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

function UserAvatar({ user, size = 'small' }: {
  user: { name?: string | null; image?: string | null };
  size?: 'small' | 'medium';
}) {
  const sizeClasses = size === 'small' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = size === 'small' ? 'text-sm' : 'text-base';

  if (user.image) {
    return (
      <img
        className={`${sizeClasses} rounded-full object-cover`}
        src={user.image}
        alt={user.name || 'User avatar'}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-indigo-500 font-semibold text-white ${sizeClasses} ${textSize}`}
    >
      {getInitials(user.name)}
    </div>
  );
}
// --- End Helper ---


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Effect to handle clicking outside the dropdown ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // --- Theme Toggle Button Component ---
  const renderThemeToggle = () => {
    if (!mounted) {
      return <div className="ml-4 h-9 w-9 p-2" />; // Placeholder
    }
    return (
      <button
        type="button"
        className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-5 w-5" /> // Show Sun in dark mode
        ) : (
          <Moon className="h-5 w-5" /> // Show Moon in light mode
        )}
      </button>
    );
  };

  // --- Mobile Theme Toggle ---
  const renderMobileThemeToggle = () => {
     if (!mounted) return null;
     return (
       <button
          type="button"
          className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
            setMobileMenuOpen(false);
          }}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span>Toggle Theme</span>
        </button>
     );
  };

  // --- Auth Section Placeholder ---
  // This is rendered on the server and on initial client load
  const authPlaceholder = (
    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
      <div className="ml-4 h-9 w-9 p-2" /> 
      <div className="ml-4 h-10 w-32 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    </div>
  );

  return (
    <>
      <div className="relative bg-white dark:bg-gray-900 border-b-2 border-gray-100 dark:border-gray-800 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link
                href="/"
                className="min-h-[62px] text-center sm:h-[60px] p-0.5 flex items-center"
              >
                <Image
                  src="/final.svg"
                  alt="PhotoBytes Blog"
                  width={60}
                  height={60}
                  className="rounded-full" // Static class is safe and fixes the visual bug
                />
                <span className="ml-4 text-2xl font-bold text-gray-900 dark:text-white md:hidden">
                  PhotoBytes Blog
                </span>
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className="bg-white dark:bg-gray-900 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-10">
              <Link href="/privacy" className="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/about" className="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                About Us
              </Link>
              <Link href="/contact" className="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Contact
              </Link>
              <a
                className="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                target="_blank"
                href="https://www.facebook.com/PhotoBytes999"
                rel="noopener noreferrer"
              >
                Order
              </a>
            </nav>
            
            {/* --- Auth Section (Desktop) --- */}
            {/* This is the key fix: We use the 'status' from useSession as a 'key'.
              When status changes (e.g., 'authenticated' -> 'unauthenticated' on logout),
              React will *destroy* the old component (with mounted=true) and
              mount a *new* one (with mounted=false), matching the server render.
            */}
            <div key={status} className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              {/* We also use 'mounted' to prevent rendering the real UI on the 
                server or on the initial client load, which ensures a match.
              */}
              {!mounted ? authPlaceholder : (
                <>
                  {isAuthenticated ? (
                    // --- Logged IN UI (Desktop) ---
                    <>
                      {renderThemeToggle()}
                      <div className="relative ml-4" ref={dropdownRef}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-x-2.5 rounded-md bg-white dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                          <UserAvatar user={session.user} size="small" />
                          <span className="truncate max-w-[150px]">
                            {session.user.username || session.user.name}
                          </span>
                          <ChevronDown className="-mr-0.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {/* ... dropdown content ... */}
                              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <UserAvatar user={session.user} size="medium" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {session.user.name || session.user.username}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                      {session.user.email}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                                Dashboard
                              </Link>
                              <Link href="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                                Edit Profile
                              </Link>
                              {session.user.role === Role.ADMIN && (
                                <>
                                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                  <Link href="/admin" className="block px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                                    Admin Panel
                                  </Link>
                                  <Link href="/dev" className="block px-4 py-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setDropdownOpen(false)}>
                                    Dev Page
                                  </Link>
                                </>
                              )}
                              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                              <button onClick={() => { setDropdownOpen(false); signOut(); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                Logout
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    // --- Logged OUT UI (Desktop) ---
                    <>
                      {renderThemeToggle()}
                      <Link href="/login">
                        <button className="ml-4 whitespace-nowrap text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                          Login
                        </button>
                      </Link>
                      <Link href="/register">
                        <button className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                          Register
                        </button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
            
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        <div
          className={classNames(
            'absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden',
            mobileMenuOpen
              ? 'duration-200 ease-out opacity-100 scale-100'
              : 'duration-100 ease-in opacity-0 scale-95 pointer-events-none'
          )}
        >
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-800 divide-y-2 divide-gray-50 dark:divide-gray-700">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    className="h-[62px] w-auto rounded-full" // Static class is safe
                    src="/final.svg"
                    alt="PhotoBytes Blog"
                    width={62}
                    height={62}
                  />
                  <span className="ml-5 text-2xl font-bold text-gray-900 dark:text-white">
                    PhotoBytes Blog
                  </span>
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="py-6 px-5 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <Link href="/" className="text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/contact" className="text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                <a className="text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300" target="_blank" href="https://www.facebook.com/PhotoBytes999" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  Order
                </a>
                <Link href="/about" className="text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                  About Us
                </Link>
                <Link href="/privacy" className="text-base font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setMobileMenuOpen(false)}>
                  Privacy
                </Link>
                {renderMobileThemeToggle()}
              </div>
              
              {/* FIX: Wrap mobile auth section in 'mounted' check */}
              <div key={status}> {/* Add key here too */}
                {!mounted ? (
                  <div className="h-36" /> // Placeholder for auth buttons
                ) : (
                  <div>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                            Dashboard
                          </button>
                        </Link>
                        <Link href="/profile/edit" onClick={() => setMobileMenuOpen(false)}>
                          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                            Edit Profile
                          </button>
                        </Link>
                        
                        {session.user.role === Role.ADMIN && (
                          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700">
                                  Admin Panel
                                </button>
                              </Link>
                              <Link href="/dev" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700">
                                  Dev Page
                                </button>
                              </Link>
                          </div>
                        )}

                        <p className="mt-6 text-center text-base font-medium text-gray-500 dark:text-gray-400">
                          Welcome back!{' '}
                          <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium">
                            Logout
                          </button>
                        </p>
                      </div>
                    ) : (
                      <>
                        <Link href="/register">
                          <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                            Register
                          </button>
                        </Link>
                        <p className="mt-6 text-center text-base font-medium text-gray-500 dark:text-gray-400">
                          Existing customer?{' '}
                          <Link href="/login">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                              Login
                            </button>
                          </Link>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}