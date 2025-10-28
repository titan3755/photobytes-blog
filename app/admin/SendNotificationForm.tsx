'use client';

import { useState, useTransition } from 'react';
import { sendNotification } from './actions';
import type { User } from '@prisma/client';
// 1. Import the TargetAudience type from your actions file
import type { TargetAudience } from './actions';

type SimpleUser = Pick<User, 'id' | 'username' | 'email' | 'name'>;

interface SendNotificationFormProps {
    allUsers: SimpleUser[];
}

// 2. Define the specific type for the dropdown state
type TargetType = 'ALL_USERS' | 'ALL_BLOGGERS' | 'ALL_ADMINS' | 'SPECIFIC_USER';

export default function SendNotificationForm({ allUsers }: SendNotificationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  // 3. Apply the specific TargetType here
  const [targetType, setTargetType] = useState<TargetType>('ALL_USERS');
  const [specificUserId, setSpecificUserId] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }
    
    // --- START FIX ---
    // 4. Declare target with the correct type first
    let target: TargetAudience; 
    
    if (targetType === 'SPECIFIC_USER') {
        if (!specificUserId) {
            setError('Please select a specific user.');
            return;
        }
        // 5. Assign the object type
        target = { userId: specificUserId }; 
    } else {
        // 6. Assign the string literal type
        target = targetType; 
    }
    // --- END FIX ---

    startTransition(async () => {
      const result = await sendNotification({
        title,
        description,
        url: url || null, // Ensure null is passed if empty
        target: target,
      });

      if (!result.success) {
        setError(result.message || 'Failed to send notification.');
      } else {
        setSuccess(result.message || 'Notification sent!');
        setTitle('');
        setDescription('');
        setUrl('');
        setTargetType('ALL_USERS');
        setSpecificUserId('');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="notifTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="notifTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="notifDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="notifDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black"
        />
      </div>
      
       {/* URL (Optional) */}
       <div>
        <label htmlFor="notifUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Link URL (Optional)
        </label>
        <input
          type="url"
          id="notifUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/blog/my-new-post"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black"
        />
      </div>

      {/* Target Audience */}
      <div>
        <label htmlFor="targetType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Send To
        </label>
        <select
            id="targetType"
            value={targetType}
            // 5. FIX: Cast to the specific TargetType
            onChange={(e) => setTargetType(e.target.value as TargetType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black bg-white"
        >
            <option value="ALL_USERS">All Users</option>
            <option value="ALL_BLOGGERS">All Bloggers</option>
            <option value="ALL_ADMINS">All Admins</option>
            <option value="SPECIFIC_USER">A Specific User</option>
        </select>
      </div>

      {/* Specific User Selector (Conditional) */}
      {targetType === 'SPECIFIC_USER' && (
           <div>
            <label htmlFor="specificUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select User
            </label>
             <select
                id="specificUser"
                value={specificUserId}
                onChange={(e) => setSpecificUserId(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm text-black bg-white"
            >
                <option value="">-- Please select a user --</option>
                {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.username || user.name} ({user.email})
                    </option>
                ))}
            </select>
           </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isPending ? 'Sending...' : 'Send Notification'}
      </button>

      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}
    </form>
  );
}

