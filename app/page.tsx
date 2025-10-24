import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
// Removed Article type import if only used in ArticleCard
import ArticleCard from '@/components/home/ArticleCard'; // 1. Import the new component

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description:
    'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

// Removed the ArticleCard function from here

export default async function Home() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  return (
    // Apply workaround classes here
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      {/* Adjusted max-width and removed negative margin for centering */}
      <div className="w-full max-w-7xl mx-auto">
        <section className="w-full bg-white pt-16 pb-12 md:pt-24 md:pb-16 mb-8 rounded-b-lg shadow">
          {' '}
          {/* Added margin bottom */}
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-4">
              PhotoBytes Blog
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Technology, photography, and development. Your source for
              high-quality tutorials and insights.
            </p>
          </div>
        </section>
        <section className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {' '}
          {/* Adjusted padding */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                // 2. Use the imported ArticleCard component
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-10">
                No articles published yet. Check back soon!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

