'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  MessageSquare,
  ClipboardList,
  Bell,
  Mail,
  List,
  ShieldCheck,
} from 'lucide-react';

const tabs = [
  { name: 'Home', href: 'home', icon: Home },
  { name: 'Users', href: 'users', icon: Users },
  { name: 'Articles', href: 'articles', icon: FileText },
  { name: 'Orders', href: 'orders', icon: ClipboardList },
  { name: 'Messages', href: 'messages', icon: Mail },
  { name: 'Comments', href: 'comments', icon: MessageSquare },
  { name: 'Applications', href: 'applications', icon: List },
  { name: 'Notifications', href: 'notifications', icon: Bell },
  { name: 'Status', href: 'status', icon: ShieldCheck },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';

  return (
    <div className="mb-8">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.href === currentTab)?.href}
          onChange={(e) => {
            // This is a client-side navigation, but we'll use a full link click
            // to ensure the Server Component re-renders with new data.
            window.location.href = `/admin?tab=${e.target.value}`;
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.href}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex flex-wrap gap-x-6 gap-y-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={`/admin?tab=${tab.href}`}
                className={classNames(
                  tab.href === currentTab
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300',
                  'group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.href === currentTab ? 'page' : undefined}
              >
                <tab.icon className="-ml-0.5 h-5 w-5" />
                <span>{tab.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
