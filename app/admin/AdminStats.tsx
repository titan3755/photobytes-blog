'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from 'next-themes';
import type { Role, ApplicationStatus } from '@prisma/client';

// Define the props we'll pass from the server
type AdminStatsProps = {
  dailySignups: { name: string; users: number }[];
  contentBreakdown: { name: string; count: number }[];
  applicationData: { name: string; count: number }[];
};

// Define colors for the pie chart
const PIE_COLORS = {
  PENDING: '#f59e0b', // amber-500
  APPROVED: '#10b981', // emerald-500
  REJECTED: '#ef4444', // red-500
};

export default function AdminStats({
  dailySignups,
  contentBreakdown,
  applicationData,
}: AdminStatsProps) {
  const { resolvedTheme } = useTheme(); // Use resolvedTheme
  const isDark = resolvedTheme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#6b7281'; // gray-400 or gray-500
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 or gray-200

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: New Users (Line Chart) */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          New Users (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailySignups} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} />
            <YAxis allowDecimals={false} stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb', // Fixed typo: isGark -> isDark
              }}
              itemStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
              cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
            <Line
              type="monotone"
              dataKey="users"
              name="New Users"
              stroke="#4f46e5" // indigo-600
              strokeWidth={2}
              dot={{ r: 4, fill: '#4f46e5' }}
              activeDot={{ r: 8, stroke: isDark ? '#374151' : '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Application Status (Pie Chart) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Application Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={applicationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
              // --- START FIX: Removed fill-gray-900 and dark:fill-white ---
              className="text-xs" 
              // --- END FIX ---
            >
              {applicationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
              }}
              itemStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Content Breakdown (Bar Chart) */}
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Content Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
           <BarChart data={contentBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" allowDecimals={false} stroke={textColor} />
                <YAxis dataKey="name" type="category" stroke={textColor} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                  }}
                  itemStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
                  cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="count" name="Total Count" fill="#10b981" /> 
           </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}