'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="relative bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/" className="min-h-[62px] text-center sm:h-[60px] p-0.5 flex items-center">
                <Image
                  src="/final.svg"
                  alt="PhotoBytes Blog"
                  width={60}
                  height={60}
                />
                <span className="ml-4 text-2xl font-bold text-gray-900 md:hidden">
                  PhotoBytes Blog
                </span>
              </Link>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <button
                type="button"
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link href="/privacy" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/about" className="text-base font-medium text-gray-500 hover:text-gray-900">
                About Us
              </Link>
              <Link href="/contact" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Contact
              </Link>
              <a className="text-base font-medium text-gray-500 hover:text-gray-900" target="_blank" href="https://www.facebook.com/PhotoBytes999" rel="noopener noreferrer">
                Order
              </a>
            </nav>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link href="/login">
              <button
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Login
              </button>
              </Link>
              <Link href="/register">
              <button
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Register
              </button>
              </Link>
            </div>
          </div>
        </div>
        <div
          className={classNames(
            'absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden',
            mobileMenuOpen
              ? 'duration-200 ease-out opacity-100 scale-100'
              : 'duration-100 ease-in opacity-0 scale-95 pointer-events-none'
          )}
        >
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    className="h-[62px] w-auto"
                    src="/final.svg"
                    alt="PhotoBytes Blog"
                    width={62}
                    height={62}
                  />
                  <span className="ml-5 text-2xl font-bold text-gray-900">PhotoBytes Blog</span>
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="py-6 px-5 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <Link href="/about" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  About
                </Link>
                <Link href="/contact" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Contact
                </Link>
                <a className="text-base font-medium text-gray-900 hover:text-gray-700" target="_blank" href="https://www.facebook.com/PhotoBytes999" rel="noopener noreferrer">
                  Order
                </a>
                <a href="https://www.facebook.com/PhotoBytes999" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Help Center
                </a>
                <a href="https://www.facebook.com/PhotoBytes999" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Facebook Page
                </a>
                <a href="/privacy" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Security
                </a>
              </div>
              <div>
              <Link href="/register">
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </button>
              </Link>
                <p className="mt-6 text-center text-base font-medium text-gray-500">
                  Existing customer?{' '}
                <Link href="/login">
                  <button
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Login
                  </button>
                </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}