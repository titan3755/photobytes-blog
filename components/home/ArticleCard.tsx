'use client'; // Mark this component as a Client Component

import Link from 'next/link';
import { Article } from '@prisma/client';
import { useState } from 'react'; // Import useState for error handling

// Function to get initials for fallback (can be moved to utils if used elsewhere)
function getInitials(name?: string | null): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export default function ArticleCard({ article }: { article: Article }) {
  const [imageError, setImageError] = useState(false); // State to track image loading errors

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="block rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative w-full h-48 bg-gray-200"> {/* Fallback background */}
        {article.featuredImage && !imageError ? ( // Only render img if URL exists AND no error
          <img
            src={article.featuredImage}
            alt={article.title || 'Article image'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)} // Set error state on failure
          />
        ) : (
          // Show placeholder if no image URL or if image failed to load
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {/* You could add an icon here instead of text */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
          {article.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3">
          {article.excerpt || 'Read more...'}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}