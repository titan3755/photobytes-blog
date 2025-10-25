'use client';

import { useState, useTransition } from 'react';
import { deleteCategory } from './actions'; // We will add this to actions.ts

export default function CategoryRowActions({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${categoryName}"? This will only remove the category from articles, not delete the articles themselves.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (!result.success) {
        setError(result.message || 'Failed to delete category.');
      }
      // Success is handled by revalidation
    });
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
        title="Delete Category"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
