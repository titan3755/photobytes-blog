import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import ArticleCard from '@/components/home/ArticleCard'; // Re-using your home page card
import { Article } from '@prisma/client'; // Import Article type

// Props for the page, Next.js passes this automatically
type Props = {
  params: { slug: string };
};

// --- 1. Generate Dynamic Metadata for SEO ---
export async function generateMetadata(
  { params }: Props,
  // parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;

  // Fetch the category name
  const category = await prisma.category.findUnique({
    where: { slug: slug },
    select: { name: true },
  });

  if (!category) {
    return {
      title: 'Category Not Found | PhotoBytes Blog',
    };
  }

  return {
    title: `Articles in ${category.name} | PhotoBytes Blog`,
    description: `Browse all articles filed under the category: ${category.name}.`,
  };
}

// --- 2. The Page Component ---
export default async function CategoryPage({ params }: Props) {
  const slug = params.slug;

  // Fetch the category AND all its published articles in one query
  const category = await prisma.category.findUnique({
    where: {
      slug: slug,
    },
    include: {
      articles: {
        where: {
          published: true, // Only show published articles
        },
        orderBy: {
          createdAt: 'desc', // Show newest first
        },
      },
    },
  });

  // If no category is found for this slug, show a 404 page
  if (!category) {
    notFound();
  }

  const articles: Article[] = category.articles;

  return (
    // We'll reuse the same layout styling as your homepage
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* --- 3. Page Header --- */}
        <section className="w-full bg-white dark:bg-gray-800 pt-16 pb-12 md:pt-24 md:pb-16 mb-8 rounded-b-lg shadow-lg dark:shadow-2xl">
          <div className="max-w-4xl mx-auto text-center px-4">
            <p className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 font-semibold">
              Category
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mt-2">
              {category.name}
            </h1>
          </div>
        </section>

        {/* --- 4. Article Grid --- */}
        <section className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Articles in this category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">
                There are no published articles in this category yet.
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// Optional: Generate Static Paths for all categories
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}