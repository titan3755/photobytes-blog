import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import type { CommentWithAuthor } from './CommentItem';
import { unstable_noStore as noStore } from 'next/cache';
import type { Session } from 'next-auth'; // 1. Import the Session type

interface CommentsSectionProps {
  articleId: string;
  articleSlug: string;
}

export default async function CommentsSection({ articleId, articleSlug }: CommentsSectionProps) {
  noStore(); // 2. Add this line at the top

  // 1. Get session and explicitly type it
  const session: Session | null = await auth();

  // 2. Fetch comments for this article
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
    <section className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h2>
      
      {/* 3. Render Comment Form */}
      <div className="mb-8">
        <CommentForm 
            articleId={articleId} 
            session={session} 
            articleSlug={articleSlug}
        />
      </div>

      {/* 4. Render Comment List */}
      <div className="space-y-6">
         {comments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment as CommentWithAuthor} />
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

