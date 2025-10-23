import { auth } from '@/auth'; // 1. Import server-side auth
import prisma from '@/lib/prisma';
import { Article } from '@prisma/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * A simple row component for managing an article.
 */
function UserArticleRow({ article }: { article: Article }) {
  return (
    <li className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{article.title}</h3>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-full ${
            article.published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {article.published ? 'Published' : 'Draft'}
        </span>
      </div>
      <div className="space-x-2">
        <Link
          href={`/dashboard/articles/edit/${article.slug}`}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
        >
          Edit
        </Link>
        <Link
          href={`/dashboard/articles/delete/${article.slug}`}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
        >
          Delete
        </Link>
      </div>
    </li>
  );
}

export default async function Dashboard() {
  // 2. Get the user's session
  const session = await auth();

  // Your middleware is already protecting this page,
  // so we know the user is logged in.
  // This check is safe because our callbacks now provide the id.
  if (!session?.user?.id) {
    // This should theoretically not be reachable,
    // but it's good practice.
    console.error('Session not found, redirecting to login.');
    redirect('/api/auth/signin');
  }

  // 3. Fetch this user's articles
  const userArticles = await prisma.article.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  // Check user role for conditional UI
  const userRole = session.user.role;
  const canPostArticles = userRole === 'ADMIN' || userRole === 'BLOGGER';

  return (
    <div className="min-h-screen w-full bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, {session.user.username || session.user.name}!
        </h1>

        {/* 4. Conditional Admin Link */}
        {userRole === 'ADMIN' && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <Link
              href="/admin"
              className="font-bold text-blue-700 hover:underline"
            >
              You are an Admin. Go to Admin Panel &rarr;
            </Link>
          </div>
        )}

        {/* 5. Article Management Section */}
        {/* This entire section will only show for ADMIN or BLOGGER */}
        {canPostArticles ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Articles</h2>
              <Link
                href="/dashboard/articles/new"
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Create New Article
              </Link>
            </div>

            <ul className="space-y-4">
              {userArticles.length > 0 ? (
                userArticles.map((article) => (
                  <UserArticleRow key={article.id} article={article} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  You haven't written any articles yet.
                </p>
              )}
            </ul>
          </div>
        ) : (
          // This will show for a normal 'USER'
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Dashboard
            </h2>
            <p className="text-gray-600">
              Welcome to your personal dashboard. You can manage your profile,
              view your comments, and more.
            </p>
            {/* You can add links to /profile or other user-specific pages here */}
          </div>
        )}
      </div>
    </div>
  );
}