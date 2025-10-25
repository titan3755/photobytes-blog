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
      {/* --- START FIX: Added min-w-0 to allow text wrapping in flexbox --- */}
      <div className="flex-1 min-w-0">
      {/* --- END FIX --- */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900 truncate"> {/* Added truncate as a safeguard */}
            {comment.author.name || comment.author.username || 'User'}
          </h4>
          <time className="text-xs text-gray-500 flex-shrink-0 ml-2"> {/* Added margin */}
            {new Date(comment.createdAt).toLocaleDateString()}
          </time>
        </div>
        {/* --- START FIX: Added break-words to force long strings to wrap --- */}
        <p className="mt-1 text-md text-gray-700 whitespace-pre-wrap break-words">
        {/* --- END FIX --- */}
          {comment.content}
        </p>
      </div>
    </li>
  );
}