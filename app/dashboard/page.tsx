import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import {
  Article,
  Role,
  ApplicationStatus,
  UserNotification,
  Notification,
  Comment,
  Order,        // 1. Import Order
  OrderStatus,
  Prisma, // 1. Import Prisma
} from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar';
import UserArticleRow from '@/components/dashboard/UserArticleRow';
import NotificationItem from '@/components/dashboard/NotificationItem';
// --- START FIX: Import noStore ---
import { unstable_noStore as noStore } from 'next/cache';
// --- END FIX ---

// --- 1. Import the new components ---
import DashboardCard from '@/components/dashboard/DashboardCard';
import ApplicationStatusDisplay from '@/components/dashboard/ApplicationStatusDisplay';
import DashboardOrderActions from '@/components/dashboard/DashboardOrderActions';

// --- 2. REMOVED the local DashboardCard function ---

// --- 3. REMOVED the local ApplicationStatusDisplay function ---


// Define the type for the comment query
type CommentWithArticle = Prisma.CommentGetPayload<{
  include: { 
    article: { 
      select: { title: true, slug: true }
    }
  }
}>;

export default async function Dashboard() {
  // --- START FIX: Force this page to be dynamic ---
  noStore();
  // --- END FIX ---
  
  const session = await auth();

  if (!session?.user?.id) {
// ... (rest of the file is identical) ...
    console.error('Session or user ID not found, redirecting to login.');
    redirect('/api/auth/signin?error=SessionRequired');
  }

  const userId = session.user.id;
  const userRole = session.user.role; // This will now be fresh
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

  // --- Fetch Articles (if user is blogger/admin) ---
  let userArticles: Article[] = [];
  if (canPostArticles) {
    userArticles = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // --- 3. REWORKED: Fetch Application Status *only if needed* ---
  let applicationStatus: ApplicationStatus | null = null;
  if (userRole === Role.USER) {
    // Only query the application status if the user is still a 'USER'
    const application = await prisma.bloggerApplication.findUnique({
      where: { userId: userId },
      select: { status: true },
    });
    applicationStatus = application?.status ?? null;
  }
  // --- END REWORK ---

  // --- Fetch Recent Comments ---
  const userComments: CommentWithArticle[] = await prisma.comment.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      article: {
        select: { title: true, slug: true },
      },
    },
  });

  const userOrders = await prisma.order.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  // Safely create the joinedDate string
  const joinedDate = session.user.createdAt 
    ? new Date(session.user.createdAt).toLocaleDateString() 
    : null;

  return (
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

        <DashboardCard title="Your Recent Orders" className="md:col-span-2">
          {userOrders.length > 0 ? (
            <ul className="space-y-4">
              {userOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {order.category}
                    </p>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md"
                      title={order.description}
                    >
                      {order.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Submitted: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {/* 5. Use the new Client Component */}
                    <DashboardOrderActions order={order} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              You haven't placed any orders yet.
            </p>
          )}
          <div className="mt-6 text-right">
            <Link
              href="/order"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
            >
              Place a New Order
            </Link>
          </div>
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
              {joinedDate && (
                <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {joinedDate}
                </p>
              )}
            </div>
            {/* --- START MODIFICATION: Added flex and View Profile link --- */}
            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                View Profile
              </Link>
              <Link
                href="/profile/edit"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
            {/* --- END MODIFICATION --- */}
          </DashboardCard>

          {/* --- Updated Comments Card --- */}
          <DashboardCard title="Your Recent Comments" className="md:col-span-1">
             {userComments.length > 0 ? (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {userComments.map(comment => (
                        <li key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                             <p className="text-gray-700 dark:text-gray-300 text-sm truncate" title={comment.content}>
                                {comment.content}
                             </p>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                On: 
                                {comment.article ? (
                                  <Link href={`/blog/${comment.article.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                    {comment.article.title}
                                  </Link>
                                ) : (
                                  <span className="italic text-gray-400 dark:text-gray-500">Article not found</span>
                                )}
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

        {/* --- REWORKED: Logic for Article/Application sections --- */}
        
        {/* If user is Admin or Blogger, show Article Management */}
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

        {/* If user is just a USER, show the Application Status card */}
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