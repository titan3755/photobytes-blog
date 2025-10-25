'use client';

import { useState, useTransition } from 'react';
import { deleteArticle } from '@/app/admin/actions'; // Adjust import path if needed

export default function DeleteArticleButton({
  articleId,
  articleTitle,
}: {
  articleId: string;
  articleTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete the article "${articleTitle}"? This cannot be undone.`)) {
      return;
    }
    setError(null); // Clear previous errors
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (!result.success) {
        setError(result.message || 'Failed to delete article.');
      }
      // Success is handled by page revalidation/refresh
    });
  };

  return (
    // Use inline-block or similar if placing next to other buttons
    <div className="inline-block">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete Article"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {/* Optionally display error below button */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}