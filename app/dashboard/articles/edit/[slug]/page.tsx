'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { updateArticle, fetchArticleForEdit } from './actions';
import { getCategories } from '@/app/admin/actions'; // Import category fetcher
import type { Article, Category } from '@prisma/client'; // Import types

// Define Props for the fetched article (includes categories)
type ArticleWithCategories = Article & {
  categories: { id: string }[];
};

const EditArticlePage = () => {
  const params = useParams();
  const currentSlug = params.slug as string;
  const router = useRouter();

  // --- State Definitions ---
  const [article, setArticle] = useState<ArticleWithCategories | null>(null); // Use updated type
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  
  // --- New Category States ---
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  // --- End New Category States ---

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Existing Article Data AND All Categories
  useEffect(() => {
    if (!currentSlug) {
        setError('Article slug not found in URL.');
        setIsLoading(false);
        return;
    }

    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch article data and all categories in parallel
        const [fetchedArticle, fetchedCategories] = await Promise.all([
          fetchArticleForEdit(currentSlug), // This now returns article with category IDs
          getCategories() // Fetches all categories
        ]);

        if (!fetchedArticle) {
          setError('Article not found or you do not have permission to edit it.');
          setIsLoading(false);
          return;
        }

        // Set state from fetched data
        setArticle(fetchedArticle as ArticleWithCategories); // Cast to correct type
        setTitle(fetchedArticle.title);
        setSlug(fetchedArticle.slug);
        setExcerpt(fetchedArticle.excerpt || '');
        setFeaturedImage(fetchedArticle.featuredImage || '');
        setContent(fetchedArticle.content);
        
        // Set category states
        setAllCategories(fetchedCategories);
        // Pre-select the checkboxes for the article's current categories
        setSelectedCategoryIds(fetchedArticle.categories.map(cat => cat.id));

        setIsLoadingCategories(false);

      } catch (e: any) {
        setError(e.message || 'Failed to load article data.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [currentSlug, router]); // Depend on currentSlug


  // Helper functions
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
   
  // --- New Category Checkbox Handler ---
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId) // Uncheck
        : [...prevSelected, categoryId] // Check
    );
  };


  const handleSave = async (publish: boolean) => {
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
          categoryIds: selectedCategoryIds, // Pass the selected IDs
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
  if (isLoading || isLoadingCategories) { // Check both loading states
    return (
      <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading article...</p>
      </div>
    );
  }
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
          Edit Article: {title}
        </h1>

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

          {/* --- START: Categories Selection (Populated) --- */}
           <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                {allCategories.length > 0 ? (
                    <div className="mt-2 space-y-2 border border-gray-200 rounded-md p-4 max-h-40 overflow-y-auto">
                        {allCategories.map((category) => (
                            <div key={category.id} className="flex items-center">
                                <input
                                    id={`category-${category.id}`}
                                    name="categories"
                                    type="checkbox"
                                    value={category.id}
                                    // Use selectedCategoryIds to set checked state
                                    checked={selectedCategoryIds.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`category-${category.id}`} className="ml-3 block text-sm text-gray-700">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No categories found. <Link href="/admin" className="text-blue-600 hover:underline">Create categories</Link> in the admin panel.</p>
                )}
           </div>
           {/* --- END: Categories Selection (Populated) --- */}


          {/* Tiptap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
             <TiptapEditor
                key={article.id} // Key ensures editor re-initializes if slug changes (though not ideal)
                content={content}
                onChange={handleContentChange}
            />
          </div>

          {/* Error/Success Messages */}
          {error && !isLoading && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4">
             <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </Link>
             <div className="flex justify-end gap-4">
                <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isPending || isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                {isPending ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isPending || isLoading}
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
};

export default EditArticlePage;