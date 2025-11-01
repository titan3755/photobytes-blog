import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { Article, Prisma } from '@prisma/client';
import ArticleCard from '@/components/home/ArticleCard';
import SearchBar from '@/components/home/SearchBar';
import PaginationControls from '@/components/home/PaginationControls';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description:
    'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

export default async function Home({
  searchParams,
}: {
  searchParams?: { 
    search?: string;
    page?: string;
  };
}) {

  const searchQuery = searchParams?.search || '';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 6;
  const skip = (currentPage - 1) * pageSize;

  const whereClause = {
    published: true,
    title: {
      contains: searchQuery,
      mode: Prisma.QueryMode.insensitive,
    },
  };

  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: skip,
    }),
    prisma.article.count({
      where: whereClause,
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-full mx-auto">
        
        {/* --- START: New Hero Section --- */}
        <section className="relative w-full h-[70vh] min-h-[450px] flex flex-col items-center justify-center rounded-b-lg shadow-lg dark:shadow-2xl mb-8 overflow-hidden">
          
          {/* --- START FIX: Simplified Background --- */}
          {/* We remove the 'fixed' wrapper. The Image with 'fill' will
              now be 'absolute' and fill its 'relative' parent <section> */}
          <Image
            src="https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg"
            alt="Abstract technology background"
            fill
            priority
            className="object-cover rounded-2xl" // Sits in the background
          />
          {/* This overlay adds a slight dimming for better text readability */}
          <div className="absolute inset-0 bg-black/40 -z-10"></div>
          {/* --- END FIX --- */}

          {/* 2. Glassmorphism Content Card */}
          <div className="relative z-10 min-w-full flex flex-col justify-center items-center mx-auto min-h-full text-center p-8 md:p-12 
                          bg-white/10 dark:bg-black/30 
                          backdrop-blur-lg 
                          rounded-2xl 
                          border border-white/20 
                          shadow-2xl">
            <h1 className="text-4xl sm:text-7xl font-extrabold text-white mb-4 
                           shadow-black [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]">
              PhotoBytes Blog
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 
                          shadow-black [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              Technology, photography, and development. Your source for
              high-quality tutorials and insights.
            </p>
          </div>
        </section>
        {/* --- END: New Hero Section --- */}
        
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
          
          {/* Pagination Controls */}
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