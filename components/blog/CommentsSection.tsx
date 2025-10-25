import prisma from '@/lib/prisma';
import { auth } from '@/auth'; // Get session server-side
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentsSectionProps {
  articleId: string;
}

export default async function CommentsSection({ articleId }: CommentsSectionProps) {
  // 1. Get session
  const session = await auth();

  // 2. Fetch comments for this article
  const comments = await prisma.comment.findMany({
    where: { articleId: articleId },
    include: {
      author: { // Include author details
        select: { name: true, username: true, image: true },
      },
    },
    orderBy: { createdAt: 'asc' }, // Show oldest comments first
  });

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>
      
      {/* 3. Render Comment Form (handles auth logic inside) */}
      <div className="mb-8">
        <CommentForm articleId={articleId} session={session} />
      </div>

      {/* 4. Render Comment List */}
      <div className="space-y-6">
         {comments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {comments.map(comment => (
                    // @ts-ignore (Type assertion for included author)
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </ul>
         ) : (
            <p className="text-gray-500 text-center py-4">
                No comments yet. Be the first to start the discussion!
            </p>
         )}
      </div>
    </section>
  );
}
