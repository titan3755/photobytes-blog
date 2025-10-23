'use client';

import { Role } from '@prisma/client';
import { useState, useTransition } from 'react';
import { updateUserRole, deleteUser } from './actions';

export default function UserRowActions({
  userId,
  currentRole,
  isCurrentUser,
}: {
  userId: string;
  currentRole: Role;
  isCurrentUser: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    startTransition(() => {
      updateUserRole(userId, newRole)
        .then((res) => {
          if (res.error) alert(res.error);
          // Success is handled by revalidation
        })
        .catch((err) => alert('An unexpected error occurred.'));
    });
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this user? This action is irreversible.'
      )
    ) {
      return;
    }

    startTransition(() => {
      deleteUser(userId)
        .then((res) => {
          if (res.error) alert(res.error);
          // Success is handled by revalidation
        })
        .catch((err) => alert('An unexpected error occurred.'));
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={isPending || isCurrentUser}
        className={`text-sm rounded-md border-gray-300 shadow-sm ${
          isCurrentUser
            ? 'bg-gray-200 text-gray-500'
            : 'bg-white text-gray-700'
        } focus:border-blue-500 focus:ring-blue-500`}
      >
        <option value={Role.USER}>USER</option>
        <option value={Role.BLOGGER}>BLOGGER</option>
        <option value={Role.ADMIN}>ADMIN</option>
      </select>
      <button
        onClick={handleDelete}
        disabled={isPending || isCurrentUser}
        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
          isCurrentUser
            ? 'bg-gray-200 text-gray-400'
            : 'bg-red-600 text-white hover:bg-red-700'
        } disabled:opacity-50`}
      >
        Delete
      </button>
    </div>
  );
}

