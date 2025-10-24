import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Article, Role } from '@prisma/client'; // Import Role
import Link from 'next/link';
import { redirect } from 'next/navigation';

// --- Reusable Card Component ---
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
      className={`bg-white p-6 rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// --- Article Row Component (for Bloggers/Admins) ---
function UserArticleRow({ article }: { article: Article }) {
  return (
    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div className="mb-2 sm:mb-0">
        <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            article.published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {article.published ? 'Published' : 'Draft'}
        </span>
        <p className="text-sm text-gray-500 mt-1">
          Last updated:{' '}
          {new Date(article.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <Link
          href={`/dashboard/articles/edit/${article.slug}`}
          className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
        >
          Edit
        </Link>
        {/* Consider adding a confirmation modal for delete later */}
        <Link
          href={`/dashboard/articles/delete/${article.slug}`} // This should ideally trigger a server action with confirmation
          className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </Link>
      </div>
    </li>
  );
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    console.error('Session or user ID not found, redirecting to login.');
    redirect('/api/auth/signin?error=SessionRequired'); // Add error for debugging
  }

  // Fetch this user's articles (only needed for bloggers/admins)
  const userRole = session.user.role;
  const canPostArticles = userRole === Role.ADMIN || userRole === Role.BLOGGER;

  let userArticles: Article[] = [];
  if (canPostArticles) {
    userArticles = await prisma.article.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // --- Placeholder for Comments ---
  // In the future, you would fetch comments here:
  // const userComments = await prisma.comment.findMany({ where: { userId: session.user.id } });
  const userCommentsCount = 0; // Placeholder

  return (
    <div className="min-h-screen w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          Welcome, {session.user.username || session.user.name}!
        </h1>

        {/* Admin Panel Link (Conditional) */}
        {userRole === Role.ADMIN && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 rounded-lg shadow-sm text-center">
            <Link
              href="/admin"
              className="font-bold text-lg text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              🚀 Go to Admin Control Panel &rarr;
            </Link>
          </div>
        )}

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Profile Information Card --- */}
          <DashboardCard title="Your Profile" className="md:col-span-1">
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Name:</span>{' '}
                {session.user.name || 'Not Set'}
              </p>
              <p>
                <span className="font-semibold">Username:</span>{' '}
                {session.user.username || 'Not Set'}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{' '}
                {session.user.email || 'Not Set'}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{' '}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    userRole === Role.ADMIN
                      ? 'bg-red-100 text-red-800'
                      : userRole === Role.BLOGGER
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {userRole}
                </span>
              </p>
               {session.user.createdAt && ( // Conditionally render if createdAt exists
                 <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {new Date(session.user.createdAt).toLocaleDateString()}
                 </p>
               )}
            </div>
            <div className="mt-6 text-right">
              <Link
                href="/profile/edit" // Assuming you'll create an edit profile page
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </DashboardCard>

          {/* --- Comments Placeholder Card --- */}
          <DashboardCard title="Your Comments" className="md:col-span-1">
            <p className="text-gray-600">
              You have made {userCommentsCount} comments.
            </p>
            {/* Add more details or a link to view comments later */}
            <p className="mt-4 text-sm text-gray-500 italic">
              (Comment management features coming soon!)
            </p>
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
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
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
              <p className="text-gray-500 text-center py-6">
                You haven&apos;t written any articles yet. Start creating!
              </p>
            )}
          </DashboardCard>
        )}

        {/* --- Apply for Blogger Role Section (Conditional) --- */}
        {userRole === Role.USER && (
          <DashboardCard
            title="Become a Blogger"
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200"
          >
            <p className="text-gray-700 mb-6">
              Interested in sharing your insights on technology, photography, or
              development? Apply to become a blogger on PhotoBytes!
            </p>
            <div className="text-center">
              <Link
                href="/apply" // Link to the application page
                className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-teal-700 transition-transform transform hover:scale-105"
              >
                Apply for Blogger Role
              </Link>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}