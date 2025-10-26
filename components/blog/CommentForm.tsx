'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { postComment } from '@/app/blog/[slug]/actions';
import type { Session } from 'next-auth';
import Link from 'next/link';

interface CommentFormProps {
  articleId: string;
  session: Session | null;
  articleSlug: string;
}

const MAX_COMMENT_LENGTH = 1000;

export default function CommentForm({ articleId, session, articleSlug }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const charsLeft = MAX_COMMENT_LENGTH - comment.length;
  const isOverLimit = charsLeft < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isOverLimit) return;

    startTransition(async () => {
      setError(null);
      const result = await postComment(articleId, comment);
      if (!result.success) {
        setError(result.message || 'Failed to post comment.');
      } else {
        setComment('');
        router.refresh();
      }
    });
  };

  // --- Case 1: Logged Out ---
  if (!session) {
    const callbackUrl = encodeURIComponent(`/blog/${articleSlug}`);
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You must be logged in to leave a comment.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/login?callbackUrl=${callbackUrl}`}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }
  
  // --- Case 2: Logged In, but Blocked ---
  if (!session.user.canComment) {
       return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-center">
            <h4 className="font-semibold text-red-700 dark:text-red-300">Commenting Disabled</h4>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                Your account is not permitted to post comments. Please contact an administrator.
            </p>
        </div>
       );
  }

  // --- Case 3: Logged In and Can Comment ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Leave a Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          maxLength={MAX_COMMENT_LENGTH}
          disabled={isPending}
          className={`mt-1 block w-full px-3 py-2 border ${
            isOverLimit ? 'border-red-500 ring-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-600`}
          placeholder={`Commenting as ${session.user.name || session.user.username}...`}
        />
        <p
          className={`text-xs mt-1 text-right ${
            isOverLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {comment.length} / {MAX_COMMENT_LENGTH}
        </p>
      </div>
      <div className="flex justify-between items-center">
         {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
         <button
            type="submit"
            disabled={isPending || !comment.trim() || isOverLimit}
            className="ml-auto inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
         >
            {isPending ? 'Posting...' : 'Post Comment'}
         </button>
      </div>
    </form>
  );
}