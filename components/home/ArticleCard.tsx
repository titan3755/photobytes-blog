'use client';

import Link from 'next/link';
import type { Article } from '@prisma/client';
import { useState, useEffect } from 'react'; // 1. Import useEffect

// A simple placeholder icon for missing images
function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

export default function ArticleCard({ article }: { article: Article }) {
  const [imageError, setImageError] = useState(false);
  // 2. Add state for the formatted date
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  // 3. Format the date *only* on the client after the component has mounted
  useEffect(() => {
    // This code will only run in the browser, ensuring the locale is consistent
    setFormattedDate(new Date(article.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }));
  }, [article.createdAt]); // Re-run if the article changes

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="block rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300 group"
    >
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
        {article.featuredImage && !imageError ? (
          <img
            src={article.featuredImage}
            alt={article.title || 'Article image'}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
          {article.excerpt || 'Read more...'}
        </p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 h-5"> 
          {/* 4. Render the date from state. It will be blank on server-render
               and pop in on client-mount, avoiding the mismatch. 
               Added h-5 to prevent layout shift.
          */}
          {formattedDate}
        </div>
      </div>
    </Link>
  );
}