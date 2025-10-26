'use client';

import { useState } from 'react';

interface FeaturedImageProps {
  src?: string | null;
  alt?: string | null;
}

export default function FeaturedImage({ src, alt }: FeaturedImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!src) {
    return null;
  }

  if (imageError) {
    return (
      <div className="relative w-full aspect-video mb-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 italic">
        Image failed to load
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
      <img
        src={src}
        alt={alt || 'Article featured image'}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={() => setImageError(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}