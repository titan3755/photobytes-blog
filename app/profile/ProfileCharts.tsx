'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

// This is the shape of the data *after* the server component processes it
export type ChartData = {
  name: string; // e.g., "Jan", "Feb", "Mar"
  comments: number;
};

interface ProfileChartProps {
  activityData: ChartData[];
}

export default function ProfileCharts({ activityData }: ProfileChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  // Set chart text/grid colors based on theme
  const textColor = isDark ? '#9ca3af' : '#6b7281'; // gray-400 or gray-500
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 or gray-200

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Your Activity (By Month)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activityData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={textColor} />
          <YAxis allowDecimals={false} stroke={textColor} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
            }}
            itemStyle={{ color: isDark ? '#e5e7eb' : '#1f2937' }}
            cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
          />
          <Legend wrapperStyle={{ color: textColor }} />
          <Line
            type="monotone"
            dataKey="comments"
            name="Comments"
            stroke="#4f46e5" // indigo-600
            strokeWidth={2}
            dot={{ r: 4, fill: '#4f46e5' }}
            activeDot={{ r: 8, stroke: isDark ? '#374151' : '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
