'use client';

import { useState, useTransition } from 'react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatus, deleteOrder } from './actions';

export default function OrderRowActions({
  order,
}: {
  order: { id: string; status: OrderStatus; description: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, newStatus);
      if (!result.success) {
        setError(result.message || 'Failed to update status.');
      }
    });
  };

  const handleDelete = () => {
    const truncated = order.description.substring(0, 30) + '...';
    if (
      !window.confirm(
        `Are you sure you want to delete this order: "${truncated}"?`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteOrder(order.id);
      if (!result.success) {
        setError(result.message || 'Failed to delete order.');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={order.status}
        onChange={handleStatusChange}
        disabled={isPending}
        className="text-xs p-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
      >
        <option value={OrderStatus.PENDING}>Pending</option>
        <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
        <option value={OrderStatus.COMPLETED}>Completed</option>
        <option value={OrderStatus.CANCELLED}>Cancelled</option>
      </select>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
      >
        Delete
      </button>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}
