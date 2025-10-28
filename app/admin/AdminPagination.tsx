'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function AdminPagination({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();

  // This function creates the new URL while preserving existing search params
  // (like ?tab=articles)
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Don't render anything if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <Link
        href={createPageURL(currentPage - 1)}
        // Disable the link if on the first page
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
        className={classNames(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
          isFirstPage
            ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        )}
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Previous</span>
      </Link>
      
      <span className="text-sm text-gray-700 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={createPageURL(currentPage + 1)}
        // Disable the link if on the last page
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
        className={classNames(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
          isLastPage
            ? 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        )}
      >
        <span>Next</span>
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

