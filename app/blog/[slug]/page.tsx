import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import FeaturedImage from '@/components/blog/FeaturedImage';
import Link from 'next/link';
import CommentsSection from '@/components/blog/CommentsSection';
import SuggestedArticleCard, {
  type PartialArticle,
} from '@/components/blog/SuggestedArticleCard';

type Props = {
  params: { slug: string };
};

// ... (generateMetadata function remains the same) ...
export async function generateMetadata(
  { params }: Props,
  // parent: ResolvingMetadata
): Promise<Metadata> {
  const prm = await params;   
  const slug = prm.slug;

  const article = await prisma.article.findUnique({
    where: { slug: slug, published: true },
    select: {
      title: true,
      excerpt: true,
      featuredImage: true,
      categories: { select: { name: true } },
    },
  });

  if (!article) {
    return {
      title: 'Article Not Found | PhotoBytes Blog',
      description: 'The requested article could not be found.',
    };
  }

  const keywords = article.categories.map((cat) => cat.name);

  const metadata: Metadata = {
    title: `${article.title} | PhotoBytes Blog`,
    description: article.excerpt || 'Read this article on PhotoBytes Blog.',
    keywords: keywords,
  };

  if (article.featuredImage) {
    metadata.openGraph = {
      title: article.title,
      description: article.excerpt || '',
      images: [{ url: article.featuredImage }],
    };
    metadata.twitter = {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
      images: [article.featuredImage],
    };
  }
  return metadata;
}

// The main page component
export default async function ArticlePage({ params }: Props) {
  const prm = await params;
  const slug = prm.slug;

  const article = await prisma.article.findUnique({
    where: {
      slug: slug,
      published: true,
    },
    include: {
      author: {
        select: { name: true, username: true },
      },
      categories: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Fetch suggested articles
  const suggestedArticles: PartialArticle[] = await prisma.article.findMany({
    where: {
      published: true,
      id: {
        not: article.id,
      },
      // Optional: uncomment to show from same category
      // categories: {
      //   some: {
      //     id: { in: article.categories.map(cat => cat.id) }
      //   }
      // }
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
    select: {
      title: true,
      slug: true,
      featuredImage: true,
      createdAt: true,
    },
  });

  return (
    // Removed bg-white. Page will inherit bg-gray-50 dark:bg-gray-900 from layout
    <div className="min-h-screen w-full min-w-screen flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* Added w-full to the article container */}
      <div className="max-w-3xl w-full mx-auto">
        <article>
          {/* Article Header */}
          <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              {article.title}
            </h1>
            {article.categories && article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 my-4">
                {article.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/blog/category/${category.slug}`}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-3">
              <span>By {article.author.name || article.author.username || 'Staff'}</span>
              <span className="text-gray-300 dark:text-gray-600">&bull;</span>
              <time dateTime={article.createdAt.toISOString()}>
                Published on {new Date(article.createdAt).toLocaleDateString()}
              </time>
              {article.updatedAt.toISOString().split('T')[0] !==
                article.createdAt.toISOString().split('T')[0] && (
                <span className="block w-full text-xs mt-1 italic text-gray-400 dark:text-gray-500">
                  (Last updated:{' '}
                  {new Date(article.updatedAt).toLocaleDateString()})
                </span>
              )}
            </div>
          </header>

          {/* Featured Image */}
          <FeaturedImage src={article.featuredImage} alt={article.title} />

          {/* Article Content */}
          <div
            className="prose prose-lg lg:prose-xl max-w-none text-gray-800 dark:text-gray-300 dark:prose-invert 
                       prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 
                       hover:prose-a:underline prose-img:rounded-md prose-img:shadow-sm 
                       prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 
                       prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 
                       prose-pre:text-gray-900 dark:prose-pre:text-gray-100 
                       prose-pre:prose-code:!text-inherit"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* --- Suggested Reads Section --- */}
        {suggestedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestedArticles.map((article) => (
                <SuggestedArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <CommentsSection articleId={article.id} articleSlug={article.slug} />
      </div>
    </div>
  );
}

