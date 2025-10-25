import type { Comment, User } from '@prisma/client';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar'; // Reusing dashboard avatar

// --- FIX: Add 'export' to the type definition ---
export type CommentWithAuthor = Comment & {
  author: Pick<User, 'id' | 'name' | 'username' | 'image'>;
};

interface CommentItemProps {
  comment: CommentWithAuthor;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <li className="flex items-start space-x-4 py-4">
      <div className="flex-shrink-0">
        <UserProfileAvatar
          src={comment.author.image}
          name={comment.author.name || comment.author.username}
          alt={comment.author.name || comment.author.username || 'User Avatar'}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">
            {comment.author.name || comment.author.username || 'User'}
          </h4>
          <time className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </time>
        </div>
        {/* Use whitespace-pre-wrap to render newlines in the comment */}
        <p className="mt-1 text-md text-gray-700 whitespace-pre-wrap">
          {comment.content}
        </p>
        {/* TODO: Add Edit/Delete buttons here for comment author or admin */}
      </div>
    </li>
  );
}

