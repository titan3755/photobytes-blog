'use client';

import { useState, useTransition } from 'react';
import TiptapEditor from '@/components/editor/TiptapEditor'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { createArticle } from './actions';
import Link from 'next/link';

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      } catch (err: any) {
        console.error("Article creation failed:", err);
        setError(err.message || 'An error occurred while saving.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create New Article
        </h1>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Title, Slug, FeaturedImage, Excerpt fields remain the same */}
           <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700"> Title <span className="text-red-500">*</span> </label>
            <input type="text" id="title" value={title} onChange={handleTitleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"/>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700"> Slug (URL) <span className="text-red-500">*</span> </label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-gray-50"/>
            <p className="mt-1 text-xs text-gray-500"> Auto-generated from title. Use lowercase letters, numbers, and hyphens. Must be unique. </p>
          </div>
           <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700"> Featured Image URL (Optional) </label>
            <input type="url" id="featuredImage" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="https://example.com/image.jpg"/>
          </div>
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700"> Excerpt (Optional) </label>
            <textarea id="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="A short summary for the article preview..."/>
          </div>


          {/* Tiptap Editor - Removed wrapper div */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            {/* --- Reverted: Removed wrapper div --- */}
            <TiptapEditor content={content} onChange={handleContentChange} />
             {/* --- End Revert --- */}
          </div>

          {/* Error/Success Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> Cancel </Link>
            <button
              type="button"
              onClick={() => handleSubmit(false)} // Save as Draft
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)} // Publish
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isPending ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}