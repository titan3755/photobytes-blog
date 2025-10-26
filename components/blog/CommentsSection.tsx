import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import type { Session } from 'next-auth'; // Import Session from 'next-auth'
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import type { CommentWithAuthor } from './CommentItem';
import { unstable_noStore as noStore } from 'next/cache';

interface CommentsSectionProps {
  articleId: string;
  articleSlug: string;
}

export default async function CommentsSection({
  articleId,
  articleSlug,
}: CommentsSectionProps) {
  noStore(); // Force dynamic rendering

  const session: Session | null = await auth();

  const comments = await prisma.comment.findMany({
    where: { articleId: articleId },
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <section className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Comments ({comments.length})
      </h2>

      <div className="mb-8">
        <CommentForm
          articleId={articleId}
          session={session}
          articleSlug={articleSlug}
        />
      </div>

      <div className="space-y-6">
        {comments.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment as CommentWithAuthor}
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to start the discussion!
          </p>
        )}
      </div>
    </section>
  );
}