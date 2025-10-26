import React from 'react';

// Define the props for the component
interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
      {children}
    </div>
  );
}

