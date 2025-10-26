'use client';

import { useState, useTransition } from 'react';
import { deleteArticle } from './actions'; // Import the new action

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
    if (!window.confirm(`Are you sure you want to delete the article "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (!result.success) {
        setError(result.message || 'Failed to delete article.');
      }
      // No success message needed, revalidatePath will refresh the table
    });
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete Article"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}
    </div>
  );
}

