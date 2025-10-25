'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define the shape of the article data this component expects
export type PartialArticle = {
  title: string;
  slug: string;
  featuredImage: string | null;
  createdAt: Date;
};

interface CardProps {
  article: PartialArticle;
}

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

export default function SuggestedArticleCard({ article }: CardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="block group rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image container */}
      <div className="relative w-full h-32 bg-gray-200">
        {article.featuredImage && !imageError ? (
          <img
            src={article.featuredImage}
            alt={article.title || 'Article image'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer" // Helps with loading images from other domains
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
        )}
      </div>
      {/* Text Content */}
      <div className="p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <time className="text-xs text-gray-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </time>
      </div>
    </Link>
  );
}