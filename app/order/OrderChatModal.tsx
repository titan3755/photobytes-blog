'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { getOrderMessages, postMessage, markMessagesAsRead } from './actions';
import { Role, type Prisma } from '@prisma/client';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar';
import { Send, X, Loader2 } from 'lucide-react';

// Define the type for the messages we'll fetch
type MessageWithSender = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: { id: true; name: true; image: true; role: true };
    };
  };
}>;

interface OrderChatModalProps {
  orderId: string;
  onClose: () => void;
}

// --- START: New, Smarter Image URL Parser ---

/**
 * Tries to parse a string to find a direct image URL.
 * Handles direct links and common proxy/encoded URLs.
 * @param url The string from the chat message.
 * @returns A direct image URL if found, otherwise null.
 */
function parseImageUrl(url: string): string | null {
  // 1. Check for standard image extensions (with optional query parameters)
  const directImageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  if (directImageRegex.test(url)) {
    return url;
  }

  // 2. Check for Google/Brave proxy URLs (e.g., /g:ce/aHR0cHM6...)
  // This regex finds the Base64-encoded URL part.
  const proxyRegex = /\/g:[a-zA-Z0-9-]+\/([a-zA-Z0-9_/-]+)/;
  const match = url.match(proxyRegex);
  
  if (match && match[1]) {
    try {
      // Decode the Base64 string
      const encodedUrl = match[1].replace(/_/g, '/').replace(/-/g, '+');
      const decodedUrl = atob(encodedUrl);
      
      // 3. After decoding, check if the *decoded* URL is an image.
      if (isImageUrl(decodedUrl)) {
        return decodedUrl;
      }
    } catch (e) {
      console.error("Failed to decode Base64 URL:", e);
      return null;
    }
  }

  return null; // Not an image URL we can handle
}

/**
 * A simple helper for the parser function above.
 */
function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
}
// --- END: New Image URL Parser ---

export default function OrderChatModal({ orderId, onClose }: OrderChatModalProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await getOrderMessages(orderId);
      setMessages(fetchedMessages);
    } catch (err) {
      setError('Failed to load messages.' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    markMessagesAsRead(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    startSending(async () => {
      setError(null);
      const result = await postMessage(orderId, newMessage);
      if (!result.success) {
        setError(result.message || 'Failed to send.');
      } else {
        setNewMessage(''); // Clear input
        loadMessages(); // Refresh messages
      }
    });
  };

  const currentUserId = session?.user?.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Order Messages
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Chat Messages) */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading messages...</p>
          ) : error ? (
            <p className="text-center text-red-500 dark:text-red-400">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No messages for this order yet.
            </p>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.senderId === currentUserId;
              const isAdmin = msg.sender.role === Role.ADMIN;
              const imageUrl = parseImageUrl(msg.content);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar (Show for "other" person) */}
                  {!isSelf && (
                    <div className="flex-shrink-0">
                      <UserProfileAvatar
                        name={msg.sender.name || msg.sender.role}
                        src={msg.sender.image}
                        alt={msg.sender.name || 'Sender'}
                      />
                    </div>
                  )}
                  
                  {/* Conditionally render image or text */}
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg ${
                      isSelf
                        ? 'bg-blue-600 text-white'
                        : isAdmin
                        ? 'bg-red-100 dark:bg-red-900/30 dark:border dark:border-red-700 text-red-900 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    } ${imageUrl ? 'p-1' : 'p-3'}`}
                  >
                    <p className={`text-sm font-semibold ${imageUrl ? 'hidden' : 'mb-1'}`}>
                      {isSelf ? 'You' : msg.sender.name || 'Admin'}
                    </p>

                    {imageUrl ? (
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={imageUrl} 
                          alt="User provided content"
                          className="max-w-[250px] rounded-md hover:opacity-80 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                      </a>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-2 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Avatar (Show for "self") */}
                  {isSelf && (
                    <div className="flex-shrink-0">
                      <UserProfileAvatar
                        name={session?.user.name}
                        src={session?.user.image}
                        alt="You"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Modal Footer (Form) */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message or paste an image URL..."
              disabled={isSending}
              className="block w-full px-4 py-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="p-2.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

