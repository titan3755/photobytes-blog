'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { postComment } from '@/app/blog/[slug]/actions';
import type { Session } from 'next-auth';
import Link from 'next/link';

interface CommentFormProps {
  articleId: string;
  session: Session | null;
  articleSlug: string; // 1. Added articleSlug to props
}

export default function CommentForm({
  articleId,
  session,
  articleSlug, // 2. Destructure articleSlug
}: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    startTransition(async () => {
      setError(null);
      const result = await postComment(articleId, comment);
      if (!result.success) {
        setError(result.message || 'Failed to post comment.');
      } else {
        setComment(''); // Clear the text area on success
        router.refresh();
      }
    });
  };

  // --- Case 1: Logged Out ---
  if (!session) {
    // 3. Use articleSlug to create the correct callbackUrl
    const callbackUrl = encodeURIComponent(`/blog/${articleSlug}`);
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600 mb-4">
          You must be logged in to leave a comment.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href={`/login?callbackUrl=${callbackUrl}`} // 4. Apply callbackUrl
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <h4 className="font-semibold text-red-700">Commenting Disabled</h4>
        <p className="text-red-600 text-sm mt-1">
          Your account is not permitted to post comments. Please contact an
          administrator.
        </p>
      </div>
    );
  }

  // --- Case 3: Logged In and Can Comment ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700"
        >
          Leave a Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          disabled={isPending}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black disabled:bg-gray-50"
          placeholder={`Commenting as ${session.user.name || session.user.username}...`}
        />
      </div>
      <div className="flex justify-between items-center">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isPending || !comment.trim()}
          className="ml-auto inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

