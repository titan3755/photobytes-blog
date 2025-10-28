import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Role, Prisma } from '@prisma/client';
import { getProfileData } from './actions';
import type { ProfileData } from './actions';
import UserProfileAvatar from '@/components/dashboard/UserProfileAvatar';
import ProfileActions from './ProfileActions'; // Import the client actions
import ProfileCharts from './ProfileCharts'; // 1. Import the new chart component
import type { ChartData } from './ProfileCharts'; // Import chart data type

// Helper component for stats
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// Define the type for the recent comments
type RecentComment = Prisma.CommentGetPayload<{
  include: { 
    article: { 
      select: { title: true, slug: true }
    }
  }
}>;


export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/profile');
  }

  // Fetch all profile data using the server action
  let profileData: ProfileData;
  try {
    profileData = await getProfileData();
  } catch {
    return (
      <div className="min-h-screen w-full p-8 flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          Failed to load profile data.
        </p>
      </div>
    );
  }

  const { commentCount, articleCount, recentComments, commentActivity } = profileData;
  const userRole = session.user.role;
  const joinedDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString()
    : null;

  // --- 2. Process data for the chart ---
  // Create a 12-month array (e.g., ["Jan", "Feb", ...])
  const activityData: ChartData[] = new Array(12).fill(0).map((_, i) => ({
    name: new Date(2000, i).toLocaleString('en-US', { month: 'short' }),
    comments: 0,
  }));
  
  // Aggregate comment counts by month
  commentActivity.forEach(comment => {
    const monthIndex = new Date(comment.createdAt).getMonth(); // 0 = Jan, 1 = Feb, etc.
    activityData[monthIndex].comments++;
  });
  // --- End data processing ---

  return (
    <div className="min-h-screen w-full p-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        
        {/* --- Profile Header Card --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              {/* --- FIX: Pass props individually --- */}
              <UserProfileAvatar
                src={session.user.image}
                name={session.user.name}
                alt={session.user.name || 'User Avatar'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">
                {session.user.name || 'No Name Set'}
              </h1>
              <p className="text-md text-gray-500 dark:text-gray-400 truncate">
                {session.user.email || 'No Email Set'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                 <p>
                    <span className="font-semibold">Username:</span>{' '}
                    {session.user.username || 'Not Set'}
                 </p>
                 <span className="hidden sm:inline">&bull;</span>
                 {joinedDate && (
                    <p>
                      <span className="font-semibold">Joined:</span> {joinedDate}
                    </p>
                 )}
                 <span className="hidden sm:inline">&bull;</span>
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
              </div>
            </div>
          </div>
          {/* Render the client component for action buttons */}
          <ProfileActions />
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatItem label="Total Articles" value={articleCount} />
            <StatItem label="Total Comments" value={commentCount} />
        </div>

        {/* --- 3. Render the Chart Component --- */}
        <ProfileCharts activityData={activityData} />

        {/* --- Recent Activity --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Your Recent Comments
          </h2>
          {recentComments.length > 0 ? (
            <ul className="space-y-3">
              {(recentComments as RecentComment[]).map((comment) => (
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
                    {comment.article ? (
                      <Link
                        href={`/blog/${comment.article.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {comment.article.title}
                      </Link>
                    ) : (
                      <span className="italic text-gray-400 dark:text-gray-500">
                        Article not found
                      </span>
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
        </div>

      </div>
    </div>
  );
}