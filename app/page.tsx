import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description:
    'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

/**
 * A simple card component to display an article.
 */
function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="block rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative w-full h-48">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
          {article.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3">
          {article.excerpt || 'Read more...'}
        </p>
        <div className="mt-4 text-sm text-gray-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="min-h-screen min-w-screen bg-gray-50 -mt-16">
      <section className="w-full bg-white pt-24 pb-16">
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
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Latest Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.length > 0 ? (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">
              No articles published yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}