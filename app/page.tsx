import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
// --- START FIX: Import Prisma enum ---
import { Article, Prisma } from '@prisma/client';
// --- END FIX ---
import ArticleCard from '@/components/home/ArticleCard';
import SearchBar from '@/components/home/SearchBar'; // 1. Import the new SearchBar

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description:
    'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

// 2. Accept searchParams as a prop
export default async function Home({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  
  // 3. Get the search query from the URL
  const searchQuery = searchParams?.search || '';

  // 4. Create a dynamic where clause for Prisma
  const whereClause = {
    published: true,
    title: {
      contains: searchQuery,
      // --- START FIX: Use Prisma.QueryMode enum ---
      mode: Prisma.QueryMode.insensitive, // 'insensitive' ignores case
      // --- END FIX ---
    },
  };

  const articles = await prisma.article.findMany({
    where: whereClause, // 5. Apply the where clause
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto">
        <section className="w-full bg-white dark:bg-gray-800 pt-16 pb-12 md:pt-24 md:pb-16 mb-8 rounded-b-lg shadow-lg dark:shadow-2xl">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
              PhotoBytes Blog
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              Technology, photography, and development. Your source for
              high-quality tutorials and insights.
            </p>
          </div>
        </section>
        
        <section className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* 6. Add the SearchBar component */}
          <SearchBar />

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {/* 7. Make title dynamic */}
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Articles'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              // 8. Update the "no articles" message
              <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">
                {searchQuery
                  ? 'No articles found matching your search. Try another term!'
                  : 'No articles published yet. Check back soon!'}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}