'use client';

import { useState, useTransition } from 'react';
import { OrderStatus, Order } from '@prisma/client'; // 1. Import Order
import { updateOrderStatus, deleteOrder } from './actions';
import OrderChatModal from '../order/OrderChatModal'; // 2. Import the modal

export default function OrderRowActions({
  order,
}: {
  order: Order; // 3. Accept the full order object
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 4. Add modal state

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
    <>
      <div className="flex items-center gap-2">
        {/* 5. Add View Messages Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          Messages
        </button>

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
      </div>
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs text-right">{error}</p>
      )}

      {/* 6. Render Modal Conditionally */}
      {isModalOpen && (
        <OrderChatModal
          orderId={order.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

