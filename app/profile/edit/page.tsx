'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile } from './actions';

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Submission status
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState('');

  // Pre-fill form when session loads
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      setName(session.user.name || '');
      setUsername(session.user.username || '');
      setImage(session.user.image || '');
    } else if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/edit');
    }
  }, [session, status, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setSubmitMessage('');

    // --- Start: Client-side Validation ---
    if (!name.trim()) {
      setSubmitMessage('Name cannot be empty.'); setSubmitStatus('error'); return;
    }
    if (!username.trim()) {
      setSubmitMessage('Username cannot be empty.'); setSubmitStatus('error'); return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setSubmitMessage('Username can only contain letters, numbers, and underscores.'); setSubmitStatus('error'); return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setSubmitMessage('Passwords do not match.'); setSubmitStatus('error'); return;
    }
    if (newPassword && newPassword.length < 6) {
        setSubmitMessage('Password must be at least 6 characters long.'); setSubmitStatus('error'); return;
    }
    // --- End: Client-side Validation ---


    startTransition(async () => {
      try {
        const result = await updateProfile({
          name: name.trim(),
          username: username.trim(),
          image: image.trim() || null,
          newPassword: newPassword || null,
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to update profile.');
        }

        setSubmitStatus('success');
        setSubmitMessage('Profile updated successfully!');
        setNewPassword('');
        setConfirmPassword('');

        await update({
          ...session,
          user: {
            ...session?.user,
            name: name.trim(),
            username: username.trim(),
            image: image.trim() || null,
          },
        });

      } catch (err: any) {
        console.error('Profile update error:', err);
        setSubmitStatus('error');
        setSubmitMessage(err.message || 'An error occurred.');
      }
    });
  };

  // Loading state
  if (status === 'loading') { /* ... */
     return (
      <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }
  if (!isAuthenticated) { /* ... */
     return (
      <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
        <p className="text-red-500">Redirecting to login...</p>
      </div>
    );
  }

  // Apply workaround classes to the main return div
  return (
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Edit Your Profile
          </h1>
          <p className="mt-2 text-md text-gray-600">
            Update your name, username, image, and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700"> Email (Cannot be changed) </label>
            <input id="email" type="email" value={session?.user?.email || ''} readOnly className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 bg-gray-100 cursor-not-allowed text-gray-700 focus:outline-none" />
          </div>

          {/* Name */}
          <div>
             <label htmlFor="name" className="block text-sm font-medium text-gray-700"> Name <span className="text-red-500">*</span> </label>
             <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="Your full name" />
          </div>

          {/* Username */}
          <div>
             <label htmlFor="username" className="block text-sm font-medium text-gray-700"> Username <span className="text-red-500">*</span> </label>
             <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="Choose a unique username" aria-describedby="username-description" />
             <p className="mt-1 text-xs text-gray-500" id="username-description"> Letters, numbers, and underscores only. This will be used for your profile URL if implemented. </p>
          </div>

           {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Profile Image URL (Optional)
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
              placeholder="https://example.com/your-image.jpg"
            />
            {image && (
                <div className="mt-2">
                    {/* --- START FIX: Added referrerPolicy --- */}
                    <img
                       src={image}
                       alt="Profile preview"
                       referrerPolicy="no-referrer" // Add this attribute
                       className="h-16 w-16 rounded-full object-cover inline-block border border-gray-200" // Added border for visibility
                     />
                    {/* --- END FIX --- */}
                </div>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700"> New Password (Optional) </label>
            <input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="Leave blank to keep current password" aria-describedby="password-description"/>
             <p className="mt-1 text-xs text-gray-500" id="password-description"> Must be at least 6 characters long. </p>
          </div>

          {/* Confirm New Password */}
          {newPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700"> Confirm New Password <span className="text-red-500">*</span> </label>
              <input id="confirmPassword" name="confirmPassword" type="password" required={!!newPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 rounded-md shadow-sm border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900" placeholder="Re-type your new password"/>
            </div>
          )}


          {/* Submission Button and Status */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline"> Cancel </Link>
            <button type="submit" disabled={isPending || submitStatus === 'success'} className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" >
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {submitMessage && (
              <p className={`text-center text-sm font-medium ${ submitStatus === 'success' ? 'text-green-600' : 'text-red-600' }`} > {submitMessage} </p>
          )}
        </form>
      </div>
    </div>
  );
}