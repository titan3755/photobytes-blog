import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Article, Prisma } from '@prisma/client';
import ArticleCard from '@/components/home/ArticleCard';
import SearchBar from '@/components/home/SearchBar';
import PaginationControls from '@/components/home/PaginationControls'; // 1. Import Pagination

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description:
    'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

// --- START: Pagination & Search Params ---
export default async function Home({
  searchParams,
}: {
  searchParams?: { 
    search?: string;
    page?: string; // 2. Accept 'page'
  };
}) {

  const sp = await searchParams;
  
  const searchQuery = sp?.search || '';
  const currentPage = Number(sp?.page) || 1; // 3. Get current page, default to 1
  const pageSize = 6; // 4. Define how many articles per page
  const skip = (currentPage - 1) * pageSize; // 5. Calculate offset

  // 6. Define the where clause for both search and filtering
  const whereClause = {
    published: true,
    title: {
      contains: searchQuery,
      mode: Prisma.QueryMode.insensitive,
    },
  };

  // 7. Fetch articles and total count *in parallel* for performance
  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: pageSize, // 8. Use 'take' to get only one page
      skip: skip,      // 9. Use 'skip' to offset to the correct page
    }),
    prisma.article.count({
      where: whereClause,
    })
  ]);

  // 10. Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  // --- END: Pagination & Search Params ---

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
          <SearchBar />

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Articles'}
          </h2>
          
          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">
                {searchQuery
                  ? 'No articles found matching your search. Try another term!'
                  : 'No articles published yet. Check back soon!'}
              </p>
            )}
          </div>
          
          {/* --- 11. Add Pagination Controls --- */}
          {totalPages > 1 && (
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
            />
          )}

        </section>
      </div>
    </div>
  );
}