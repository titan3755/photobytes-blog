'use client';

import { useState, useEffect, useTransition } from 'react';
// import { useSession } from 'next-auth/react'; // No longer needed
import { useRouter, useParams } from 'next/navigation'; // 1. Import useParams
import Link from 'next/link';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { updateArticle, fetchArticleForEdit } from './actions';
import { Article } from '@prisma/client';

// Removed EditPageProps type, as params are no longer passed via props
// type EditPageProps = {
//  params: { slug: string };
// };

// Removed params prop
const EditArticlePage = () => {
  // 2. Get params using the hook
  const params = useParams();
  const currentSlug = params.slug as string; // Assert as string (or handle array if needed)
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
    // Ensure currentSlug is available before fetching
    if (!currentSlug) {
        setError('Article slug not found in URL.');
        setIsLoading(false);
        return;
    }

    async function loadArticle() {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        const fetchedArticle = await fetchArticleForEdit(currentSlug);
        if (!fetchedArticle) {
          setError('Article not found or you do not have permission to edit it.');
          setIsLoading(false);
          // router.push('/dashboard?error=ArticleNotFound'); // Keep user on page to see error
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
        // router.push('/dashboard?error=LoadFailed');
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [currentSlug, router]); // Depend on currentSlug from useParams


  // Helper functions remain the same
  const generateSlug = (str: string) => { /* ... */
      return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
   };
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */
      const newTitle = e.target.value;
    setTitle(newTitle);
   };
  const handleContentChange = (newContent: string) => { /* ... */
      setContent(newContent);
   };

   // --- FIX: Renamed function back to handleSave ---
  const handleSave = async (publish: boolean) => {
    // --- END FIX ---
    // No e.preventDefault() needed as buttons are type="button"
    setError(null);
    setSuccess(null);

    if (!article) { setError("Cannot save, article data is missing."); return; }
    if (!title || !slug || !content) { setError('Title, Slug, and Content are required.'); return; }

    startTransition(async () => {
      try {
        const result = await updateArticle({
          articleId: article.id,
          title: title.trim(),
          slug: slug.trim(),
          content: content,
          excerpt: excerpt.trim() || null,
          featuredImage: featuredImage.trim() || null,
          published: publish,
        });

        if (!result.success) { throw new Error(result.message || 'Failed to update article.'); }

        setSuccess(`Article updated successfully!`);
        setTimeout(() => router.push('/dashboard'), 1500);

      } catch (err: any) {
        console.error('Article update failed:', err);
        setError(err.message || 'An error occurred while saving.');
      }
    });
  };


  // --- Loading/Error State ---
  if (isLoading) { /* ... remains the same ... */
      return (
      <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading article...</p>
      </div>
    );
  }
  // Show error state more prominently
  if (error || !article) {
      return (
          <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Article</h2>
              <p className="text-red-500 mb-6">{error || 'Article could not be loaded or you are not authorized.'}</p>
              <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">&larr; Go back to Dashboard</Link>
          </div>
      );
  }

  // --- Main Return ---
  return (
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Edit Article: {title} {/* Use state title for immediate feedback */}
        </h1>

        {/* Removed onSubmit from form */}
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700"> Title <span className="text-red-500">*</span> </label>
            <input type="text" id="title" value={title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"/>
          </div>

          {/* Slug (Editable) */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700"> Slug (URL) <span className="text-red-500">*</span> </label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 text-black bg-gray-50"/>
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
            {/* Pass key based on article ID and content length to help trigger re-render on load */}
             <TiptapEditor
                key={article.id + (content?.length || 0)}
                content={content}
                onChange={handleContentChange}
            />
          </div>

          {/* Error/Success Messages */}
          {error && !isLoading && <p className="text-red-600 text-sm">{error}</p>} {/* Hide error during initial load */}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
             <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </Link>
             <div className="flex justify-end gap-4">
                <button
                type="button"
                onClick={() => handleSave(false)} // Call handleSave directly
                disabled={isPending || isLoading} // Disable during load too
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                {isPending ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button
                type="button"
                onClick={() => handleSave(true)} // Call handleSave directly
                disabled={isPending || isLoading} // Disable during load too
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
}; // End of component definition

export default EditArticlePage; // Export component