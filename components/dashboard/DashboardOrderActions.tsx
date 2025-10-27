'use client';

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import OrderChatModal from '@/app/order/OrderChatModal'; // Adjust path if needed

// Helper for status badge (copied from dashboard)
function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let colors = '';
  switch (status) {
    case 'PENDING':
      colors = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      break;
    case 'IN_PROGRESS':
      colors = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      break;
    case 'COMPLETED':
      colors = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
    case 'CANCELLED':
      colors = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      break;
    default:
      colors = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

interface DashboardOrderActionsProps {
  order: {
    id: string;
    status: OrderStatus;
  };
}

export default function DashboardOrderActions({ order }: DashboardOrderActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <OrderStatusBadge status={order.status} />
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          View Messages
        </button>
      </div>

      {isModalOpen && (
        <OrderChatModal
          orderId={order.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
