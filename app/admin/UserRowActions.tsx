'use client';

import { useState, useTransition } from 'react';
import { Role } from '@prisma/client';
import { updateUserRole, deleteUser, toggleCommentStatus } from './actions'; // 1. Import toggleCommentStatus

export default function UserRowActions({
  userId,
  currentRole,
  isCurrentUser,
  canComment, // 2. Add canComment prop
}: {
  userId: string;
  currentRole: Role;
  isCurrentUser: boolean;
  canComment: boolean; // 2. Add canComment prop
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (newRole === currentRole) return;
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      e.target.value = currentRole; // Reset dropdown
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        setError(result.message || 'Failed to update role.');
      }
    });
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user? This action is permanent.'
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (!result.success) {
        setError(result.message || 'Failed to delete user.');
      }
    });
  };

  // 3. Add handler for toggling comment status
  const handleToggleComment = () => {
    const action = canComment ? 'block' : 'unblock';
    if (
      !window.confirm(
        `Are you sure you want to ${action} this user from commenting?`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await toggleCommentStatus(userId, canComment);
      if (!result.success) {
        setError(result.message || 'Failed to update status.');
      }
    });
  };

  if (isCurrentUser) {
    return (
      <span className="text-xs text-gray-500 italic">
        (Your Account)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={isPending}
        className="text-xs text-black p-1 border border-gray-300 rounded"
      >
        <option value={Role.USER}>USER</option>
        <option value={Role.BLOGGER}>BLOGGER</option>
        <option value={Role.ADMIN}>ADMIN</option>
      </select>
      
      {/* 4. Add new button */}
      <button
        onClick={handleToggleComment}
        disabled={isPending}
        className={`px-2 py-1 text-xs rounded ${
          canComment
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } disabled:opacity-50`}
      >
        {isPending ? '...' : canComment ? 'Block Comment' : 'Unblock'}
      </button>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
      >
        Delete
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

