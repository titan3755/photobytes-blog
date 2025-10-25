'use client';

import { useState, useTransition } from 'react';
import { createCategory } from './actions'; // We will add this to actions.ts

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // --- FIX: Removed 'new' from useTransition ---
  const [isPending, startTransition] = useTransition();
  // --- END FIX ---

  // Helper to generate slug
  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
      .replace(/[\s-]+/g, '-'); // Collapse whitespace and replace spaces
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName)); // Auto-generate slug
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }

    startTransition(async () => {
      const result = await createCategory({ name, slug });
      if (!result.success) {
        setError(result.message || 'Failed to create category.');
      } else {
        setSuccess('Category created successfully!');
        setName(''); // Clear form
        setSlug('');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="categoryName"
          className="block text-sm font-medium text-gray-700"
        >
          Category Name
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={handleNameChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>
      <div>
        <label
          htmlFor="categorySlug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug
        </label>
        <input
          type="text"
          id="categorySlug"
          value={slug}
          onChange={(e) => setSlug(generateSlug(e.target.value))} // Ensure slug is formatted
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-gray-50"
        />
         <p className="mt-1 text-xs text-gray-500">Auto-generated from name. Must be unique.</p>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isPending ? 'Adding...' : 'Add New Category'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}