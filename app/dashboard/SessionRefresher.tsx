'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ApplicationStatus, Role } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface SessionRefresherProps {
  sessionRole: Role;
  applicationStatus: ApplicationStatus | null;
}

/**
 * This client component intelligently detects if the user's
 * session (JWT) is out of sync with their actual application
 * status, and forces a session update *once*.
 */
export default function SessionRefresher({
  sessionRole,
  applicationStatus,
}: SessionRefresherProps) {
  const { update } = useSession(); // Get the 'update' function from NextAuth
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check for the *specific mismatch* we want to fix
    if (
      sessionRole === Role.USER &&
      applicationStatus === ApplicationStatus.APPROVED &&
      !isUpdating // Only run this ONCE
    ) {
      setIsUpdating(true); // Lock to prevent loops
      console.log('Stale session detected. Forcing update...');
      
      // This will trigger the 'jwt' callback in auth.ts with `trigger: "update"`.
      update()
        .then(() => {
          // AFTER the session is updated, force a page refresh.
          // This re-runs the Server Component with the new, fresh session.
          console.log('Session updated. Refreshing page...');
          router.refresh();
        })
        .catch((e) => {
          console.error("Failed to update session:", e);
          setIsUpdating(false); // Allow retry on error
        });
    }
  }, [sessionRole, applicationStatus, update, isUpdating, router]);

  // This component renders nothing.
  return null;
}