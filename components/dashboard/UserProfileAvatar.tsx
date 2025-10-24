'use client';

import { useState } from 'react';

// --- Function to get initials ---
function getInitials(name?: string | null): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

interface UserProfileAvatarProps {
    src?: string | null;
    alt?: string | null;
    name?: string | null; // For initials fallback
}

export default function UserProfileAvatar({ src, alt, name }: UserProfileAvatarProps) {
    const [imageError, setImageError] = useState(false);

    // If src is invalid or image fails to load, show fallback
    if (!src || imageError) {
        return (
             <div
                className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 text-white text-xl font-bold border-2 border-indigo-600"
                aria-label={alt || 'User avatar fallback'}
            >
                {getInitials(name)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt || 'User Avatar'}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 border-gray-300 h-16 w-16"
            onError={() => setImageError(true)} // Set error state if image fails
        />
    );
}