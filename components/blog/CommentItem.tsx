import type { Comment, User } from '@prisma/client';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar'; // Reusing dashboard avatar

// Define the type for the prop, including the author info
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {comment.author.name || comment.author.username || 'User'}
          </h4>
          <time className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </time>
        </div>
        <p className="mt-1 text-md text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </li>
  );
}