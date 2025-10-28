'use client';

import { useState, useTransition, useEffect } from 'react';
import TiptapEditor from '@/components/editor/TiptapEditor'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { createArticle } from './actions';
import { getCategories } from '@/app/admin/actions'; // Import the new fetch action
import Link from 'next/link';
import type { Category } from '@prisma/client'; // Import the Category type

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  
  // --- New Category States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  // --- End New Category States ---

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- Fetch categories on mount ---
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to load categories", err);
        setError("Could not load categories.");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []); // Empty dependency array ensures this runs once

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
    setSlug(generateSlug(newTitle));
  };

  const handleContentChange = (newContent: string) => {
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

  const handleSubmit = async (publish: boolean) => {
    setError(null);
    setSuccess(null);

    if (!title || !slug || !content) {
      setError('Title, Slug, and Content are required.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createArticle({
          title: title.trim(),
          slug: slug.trim(),
          content: content,
          excerpt: excerpt.trim() || null,
          featuredImage: featuredImage.trim() || null,
          published: publish,
          categoryIds: selectedCategoryIds, // Pass the selected IDs
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to save article.');
        }

        setSuccess(
          `Article ${
            publish ? 'published' : 'saved as draft'
          } successfully!`
        );
        router.push('/dashboard'); // Redirect on success

      } catch {
        setError('An error occurred while saving.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Article
        </h1>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Title */}
           <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300"> Title <span className="text-red-500">*</span> </label>
            <input type="text" id="title" value={title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"/>
          </div>
          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300"> Slug (URL) <span className="text-red-500">*</span> </label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-gray-50 dark:bg-gray-600 dark:text-white"/>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400"> Auto-generated from title. Use lowercase letters, numbers, and hyphens. Must be unique. </p>
          </div>
          {/* Featured Image URL */}
           <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300"> Featured Image URL (Optional) </label>
            <input type="url" id="featuredImage" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="https://example.com/image.jpg"/>
          </div>
          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300"> Excerpt (Optional) </label>
            <textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="A short summary for the article preview..."/>
          </div>

           {/* --- START: Categories Selection --- */}
           <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categories</label>
                {isLoadingCategories ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Loading categories...</p>
                ) : categories.length > 0 ? (
                    <div className="mt-2 space-y-2 border border-gray-200 dark:border-gray-600 rounded-md p-4 max-h-40 overflow-y-auto">
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center">
                                <input
                                    id={`category-${category.id}`}
                                    name="categories"
                                    type="checkbox"
                                    value={category.id}
                                    checked={selectedCategoryIds.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                />
                                <label htmlFor={`category-${category.id}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No categories found. <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">Create categories</Link> in the admin panel.</p>
                )}
           </div>
           {/* --- END: Categories Selection --- */}

          {/* Tiptap Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            {/* The TiptapEditor component itself handles its internal dark mode styles */}
            <TiptapEditor content={content} onChange={handleContentChange} />
          </div>

          {/* Error/Success Messages */}
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
             <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </Link>
            <button
              type="button"
              onClick={() => handleSubmit(false)} // Save as Draft
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)} // Publish
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isPending ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}