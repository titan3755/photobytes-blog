import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import {
  Article,
  Role,
  ApplicationStatus,
  UserNotification,
  Notification,
  Comment,
} from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar';
import UserArticleRow from '@/components/dashboard/UserArticleRow';
import NotificationItem from '@/components/dashboard/NotificationItem';

// --- Reusable Card Component (Now with dark mode) ---
function DashboardCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// Helper for status badges in dashboard (Now with dark mode)
function ApplicationStatusDisplay({ status }: { status: ApplicationStatus }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let darkBgColor = 'dark:bg-gray-700';
  let darkTextColor = 'dark:text-gray-200';
  let message = 'Your application status: ';

  if (status === ApplicationStatus.PENDING) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    darkBgColor = 'dark:bg-yellow-900';
    darkTextColor = 'dark:text-yellow-300';
    message = 'Your blogger application is currently pending review.';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    darkBgColor = 'dark:bg-green-900';
    darkTextColor = 'dark:text-green-300';
    message = 'Congratulations! Your blogger application has been approved.';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    darkBgColor = 'dark:bg-red-900';
    darkTextColor = 'dark:text-red-300';
    message =
      'Your blogger application was reviewed but not approved at this time.';
  }

  return (
    <div className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <p className="text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor} ${darkBgColor} ${darkTextColor}`}
      >
        {status}
      </span>
      {status === ApplicationStatus.REJECTED && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Please contact support if you have questions.
        </p>
      )}
    </div>
  );
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    console.error('Session or user ID not found, redirecting to login.');
    redirect('/api/auth/signin?error=SessionRequired');
  }

  const userId = session.user.id;
  const userRole = session.user.role;
  const canPostArticles = userRole === Role.ADMIN || userRole === Role.BLOGGER;

  // --- Fetch Notifications ---
  const userNotifications = await prisma.userNotification.findMany({
    where: { userId: userId },
    include: {
      notification: true,
    },
    orderBy: {
      notification: { createdAt: 'desc' },
    },
    take: 20,
  });
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  // --- Fetch Articles ---
  let userArticles: Article[] = [];
  if (canPostArticles) {
    userArticles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // --- Fetch Application Status ---
  let applicationStatus: ApplicationStatus | null = null;
  if (userRole === Role.USER) {
    const application = await prisma.bloggerApplication.findUnique({
      where: { userId: userId },
      select: { status: true },
    });
    applicationStatus = application?.status ?? null;
  }

  // --- Fetch Recent Comments ---
  const userComments = await prisma.comment.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5, // Get 5 most recent comments
    include: {
      article: {
        // Include article title and slug
        select: { title: true, slug: true },
      },
    },
  });

  return (
    // Applied the UI workaround classes here (dark mode inherited from layout)
    <div className="min-h-screen w-full p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Welcome, {session.user.username || session.user.name}!
          </h1>
          {/* Notification Bell Icon */}
          <div className="relative">
            <svg
              className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Admin Panel Link (Conditional) */}
        {userRole === Role.ADMIN && (
          <div className="mb-0 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border border-blue-300 dark:border-blue-700 rounded-lg shadow-sm text-center">
            <Link
              href="/admin"
              className="font-bold text-lg text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"
            >
              🚀 Go to Admin Control Panel &rarr;
            </Link>
            <Link
              href="/dev"
              className="block mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Go to Developer Page &rarr;
            </Link>
          </div>
        )}

        {/* Notification Card */}
        <DashboardCard title="Your Notifications" className="md:col-span-2">
          {userNotifications.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {userNotifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item as UserNotification & { notification: Notification }}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              You have no new notifications.
            </p>
          )}
        </DashboardCard>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Profile Information Card --- */}
          <DashboardCard title="Your Profile" className="md:col-span-1">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <UserProfileAvatar
                src={session.user.image}
                name={session.user.name}
                alt={session.user.name || 'User Avatar'}
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {session.user.name || 'No Name Set'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session.user.email || 'No Email Set'}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold">Username:</span>{' '}
                {session.user.username || 'Not Set'}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{' '}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    userRole === Role.ADMIN
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : userRole === Role.BLOGGER
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {userRole}
                </span>
              </p>
              {session.user.createdAt && (
                <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {new Date(session.user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="mt-6 text-right">
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </DashboardCard>

          {/* --- Updated Comments Card --- */}
          <DashboardCard title="Your Recent Comments" className="md:col-span-1">
            {userComments.length > 0 ? (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {userComments.map((comment) => (
                  <li
                    key={comment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
                  >
                    <p
                      className="text-gray-700 dark:text-gray-300 text-sm truncate"
                      title={comment.content}
                    >
                      {comment.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      On:{' '}
                      <Link
                        href={`/blog/${comment.article.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {comment.article.title}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                You haven&apos;t posted any comments yet.
              </p>
            )}
          </DashboardCard>
        </div>

        {/* --- Article Management Section (Conditional) --- */}
        {canPostArticles && (
          <DashboardCard
            title="Your Articles"
            className="col-span-1 md:col-span-2"
          >
            <div className="flex justify-end mb-4">
              <Link
                href="/dashboard/articles/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors shadow-sm"
              >
                + Create New Article
              </Link>
            </div>
            {userArticles.length > 0 ? (
              <ul className="space-y-3">
                {userArticles.map((article) => (
                  <UserArticleRow key={article.id} article={article} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                You haven&apos;t written any articles yet. Start creating!
              </p>
            )}
          </DashboardCard>
        )}

        {/* --- Apply for Blogger Role Section / Status Display (Conditional) --- */}
        {userRole === Role.USER && (
          <DashboardCard
            title="Blogger Application"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900 dark:to-cyan-900 border-teal-200 dark:border-teal-700"
          >
            {applicationStatus ? (
              <ApplicationStatusDisplay status={applicationStatus} />
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Interested in sharing your insights on technology, photography,
                  or development? Apply to become a blogger on PhotoBytes!
                </p>
                <div className="text-center">
                  <Link
                    href="/apply"
                    className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-transform transform hover:scale-105"
                  >
                    Apply for Blogger Role
                  </Link>
                </div>
              </>
            )}
          </DashboardCard>
        )}
      </div>
    </div>
  );
}