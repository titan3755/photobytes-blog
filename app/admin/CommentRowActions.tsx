'use client';

import { useState, useTransition } from 'react';
import { deleteComment } from './actions'; // We will add this action

export default function CommentRowActions({
  commentId,
  commentContent,
}: {
  commentId: string;
  commentContent: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const truncatedContent =
      commentContent.length > 50
        ? commentContent.substring(0, 50) + '...'
        : commentContent;
    if (
      !window.confirm(
        `Are you sure you want to delete this comment: "${truncatedContent}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (!result.success) {
        setError(result.message || 'Failed to delete comment.');
      }
      // Revalidation is handled by the Server Action
    });
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
        title="Delete Comment"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}