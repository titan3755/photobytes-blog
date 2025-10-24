'use client'; // Mark as a Client Component

import { useState } from 'react';

interface FeaturedImageProps {
  src?: string | null;
  alt?: string | null;
}

export default function FeaturedImage({ src, alt }: FeaturedImageProps) {
  const [imageError, setImageError] = useState(false);

  // Don't render anything if no src provided
  if (!src) {
    return null;
  }

  // If src is invalid or image fails to load, show a placeholder (or nothing)
  if (imageError) {
    return (
      <div className="relative w-full aspect-video mb-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 italic">
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
        onError={() => setImageError(true)} // Set error state on failure
      />
    </div>
  );
}