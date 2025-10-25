import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import FeaturedImage from '@/components/blog/FeaturedImage'; // Assuming this path is correct
import Link from 'next/link';
import CommentsSection from '@/components/blog/CommentsSection'; // Import new component

type Props = {
  params: { slug: string };
};

// Generate metadata dynamically for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;

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
  const slug = params.slug;

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

  return (
    // Applied workaround classes (using bg-white and adjusted padding)
    <div className="min-h-screen w-full bg-white min-w-screen flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* Added w-full to the article container */}
      <article className="max-w-3xl w-full mx-auto">

        {/* Article Header */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 my-4">
              {article.categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/blog/category/${category.slug}`}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3">
            <span>By {article.author.name || article.author.username || 'Staff'}</span>
            <span className="text-gray-300">&bull;</span>
            <time dateTime={article.createdAt.toISOString()}>
                Published on {new Date(article.createdAt).toLocaleDateString()}
            </time>
            {article.updatedAt.toISOString().split('T')[0] !==
              article.createdAt.toISOString().split('T')[0] && (
              <span className="block w-full text-xs mt-1 italic text-gray-400">
                (Last updated:{' '}
                {new Date(article.updatedAt).toLocaleDateString()})
              </span>
            )}
          </div>
        </header>

        {/* Featured Image (Optional) - Using Client Component */}
        <FeaturedImage src={article.featuredImage} alt={article.title} />

        {/* Article Content */}
        <div
          className="prose prose-lg lg:prose-xl max-w-none text-gray-800 prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:underline prose-img:rounded-md prose-img:shadow-sm prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-600 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md prose-pre:text-gray-900 prose-pre:prose-code:!text-gray-900"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* --- START FIX: Pass articleSlug prop --- */}
        <CommentsSection articleId={article.id} articleSlug={article.slug} />
        {/* --- END FIX --- */}

      </article>
    </div>
  );
}

// Optional: Generate Static Paths (uncomment if needed)
/*
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return articles.map((article) => ({ slug: article.slug }));
}
*/

