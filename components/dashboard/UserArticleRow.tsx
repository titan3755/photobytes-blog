'use client';

import { Article } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import DeleteArticleButton from './DeleteArticleButton'; // 1. Import the new component

export default function UserArticleRow({ article }: { article: Article }) {
    const [imageError, setImageError] = useState(false);

    return (
        <li className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0 gap-4">
            {/* Image Thumbnail */}
            <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded overflow-hidden">
                {article.featuredImage && !imageError ? (
                    <img
                        src={article.featuredImage}
                        alt={`Featured image for ${article.title}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Img</span>
                    </div>
                )}
            </div>

            {/* Article Info */}
            <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate" title={article.title}>
                    {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        article.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {article.published ? 'Published' : 'Draft'}
                    </span>
                    <p className="text-xs text-gray-500">
                        Updated: {new Date(article.updatedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 flex-shrink-0">
                <Link
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-md hover:bg-gray-600 transition-colors"
                    title="View Published Article"
                >
                    View
                </Link>
                <Link
                    href={`/dashboard/articles/edit/${article.slug}`}
                    className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                    Edit
                </Link>
                {/* 2. Replace Link with DeleteArticleButton */}
                <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
            </div>
        </li>
    );
}