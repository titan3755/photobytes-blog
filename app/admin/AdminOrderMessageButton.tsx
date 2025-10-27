'use client';

import { useState } from 'react';
import OrderChatModal from '@/app/order/OrderChatModal'; // 1. Import the modal
import { MessageCircle } from 'lucide-react';

interface Props {
  orderId: string;
  unreadCount: number;
}

export default function AdminOrderMessageButton({ orderId, unreadCount }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <MessageCircle className="h-4 w-4" />
        <span>View Messages</span>
        {/* Unread message indicator dot */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </button>

      {/* Render the modal when state is true */}
      {isModalOpen && (
        <OrderChatModal
          orderId={orderId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
