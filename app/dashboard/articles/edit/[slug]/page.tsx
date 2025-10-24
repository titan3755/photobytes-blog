'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { updateArticle, fetchArticleForEdit } from './actions';
import { Article } from '@prisma/client';

// Define Props inline or as a separate type definition
type EditPageProps = {
  params: { slug: string };
};

const EditArticlePage = ({ params }: EditPageProps) => { // Use const definition
  // --- FIX: Access slug directly within the function body ---
  const currentSlug = params.slug; 
  // --- END FIX ---
  const router = useRouter();

  // --- State Definitions ---
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Existing Article Data
  useEffect(() => {
    async function loadArticle() {
      setIsLoading(true);
      try {
        // Use the local currentSlug variable
        const fetchedArticle = await fetchArticleForEdit(currentSlug); 
        if (!fetchedArticle) {
          router.push('/dashboard?error=ArticleNotFound');
          return;
        }

        setArticle(fetchedArticle);
        setTitle(fetchedArticle.title);
        setSlug(fetchedArticle.slug);
        setExcerpt(fetchedArticle.excerpt || '');
        setFeaturedImage(fetchedArticle.featuredImage || '');
        setContent(fetchedArticle.content);

      } catch (e: any) {
        setError(e.message || 'Failed to load article data.');
        router.push('/dashboard?error=LoadFailed');
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug, router]); // Depend on currentSlug


  // Helper functions (same as new page)
  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Optional: Only update slug if the user hasn't modified it manually
    // setSlug(generateSlug(newTitle));
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => { // Added event 'e'
    e.preventDefault(); // Prevent default form submission
    setError(null);
    setSuccess(null);

    if (!title || !slug || !content) {
      setError('Title, Slug, and Content are required.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateArticle({
          articleId: article!.id, // Use the non-null assertion operator (!)
          title: title.trim(),
          slug: slug.trim(),
          content: content,
          excerpt: excerpt.trim() || null,
          featuredImage: featuredImage.trim() || null,
          published: publish,
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to update article.');
        }

        setSuccess(`Article updated successfully!`);
        setTimeout(() => router.push('/dashboard'), 1500);

      } catch (err: any) {
        console.error('Article update failed:', err);
        setError(err.message || 'An error occurred while saving.');
      }
    });
  };


  // --- Loading/Error State ---
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (!article || error) {
      return (
          <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
              <p className="text-red-500 text-lg">Error: {error || 'Article not found or unauthorized.'}</p>
              <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">&larr; Go to Dashboard</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Edit Article: {article.title}
        </h1>

        {/* --- FIX: Use anonymous function to call handleSubmit --- */}
        <form onSubmit={(e) => handleSubmit(e, article!.published)} className="space-y-6"> 
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700"> Title <span className="text-red-500">*</span> </label>
            <input type="text" id="title" value={title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"/>
          </div>

          {/* Slug (Editable) */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700"> Slug (URL) <span className="text-red-500">*</span> </label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:ring-blue-500 text-black bg-gray-50"/>
            <p className="mt-1 text-xs text-gray-500">Must be unique.</p>
          </div>

          {/* Featured Image URL (Optional) */}
           <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700"> Featured Image URL (Optional) </label>
            <input type="url" id="featuredImage" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="https://example.com/image.jpg"/>
          </div>

          {/* Excerpt (Optional) */}
           <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700"> Excerpt (Optional) </label>
            <textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="A short summary for the article preview..."/>
          </div>


          {/* Tiptap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <TiptapEditor 
                content={content}
                onChange={handleContentChange} 
            />
          </div>

          {/* Error/Success Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
             <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </Link>
             <div className="flex justify-end gap-4">
                <button
                type="button"
                // Save Draft: Submits the form with published: false
                onClick={(e) => handleSubmit(e, false)} 
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                {isPending ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button
                type="button"
                // Update & Publish: Submits the form with published: true
                onClick={(e) => handleSubmit(e, true)} 
                disabled={isPending}
                className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                {isPending ? 'Publishing...' : 'Update & Publish'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticlePage;
