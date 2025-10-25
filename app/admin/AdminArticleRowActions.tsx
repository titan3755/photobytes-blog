'use client';

import { useState, useTransition } from 'react';
import { deleteArticle } from './actions'; // Ensure this points to the updated action

export default function AdminArticleRowActions({
  articleId,
  articleTitle,
}: {
  articleId: string;
  articleTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    // Add a confirmation dialog
    if (!window.confirm(`ADMIN ACTION: Are you sure you want to delete the article "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      // Call the same deleteArticle action
      const result = await deleteArticle(articleId);
      if (!result.success) {
        setError(result.message || 'Failed to delete article.');
      }
      // Revalidation is handled by the Server Action
    });
  };

  return (
    // Use inline-flex if placing next to View/Edit links in admin table
    <div className="inline-flex items-center">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ml-2" // Added margin-left
        title="Delete Article (Admin)"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 text-xs ml-2">{error}</p>}
    </div>
  );
}

