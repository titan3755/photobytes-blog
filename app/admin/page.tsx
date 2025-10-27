import prisma from '@/lib/prisma';
import {
  Article,
  User,
  ContactMessage,
  Role,
  BloggerApplication,
  ApplicationStatus,
  Category,
  Notification,
  Comment,
  Order,
  OrderStatus,
} from '@prisma/client';
import UserRowActions from './UserRowActions';
import ContactMessageRowActions from './ContactMessageRowActions';
import BloggerApplicationRowActions from './BloggerApplicationRowActions';
import AdminArticleRowActions from './AdminArticleRowActions';
import CategoryForm from './CategoryForm';
import CategoryRowActions from './CategoryRowActions';
import SendNotificationForm from './SendNotificationForm';
import NotificationRowActions from './NotificationRowActions';
import CommentRowActions from './CommentRowActions';
import OrderRowActions from './OrderRowActions';
import AdminStats from './AdminStats'; // Import the new chart component
import AdminOrderMessageButton from './AdminOrderMessageButton';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ApplicationWithUser } from './BloggerApplicationModal';

// Helper function to render stat cards
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// Helper for status badges
function StatusBadge({ status }: { status: ApplicationStatus }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let darkBgColor = 'dark:bg-gray-700';
  let darkTextColor = 'dark:text-gray-200';

  if (status === ApplicationStatus.PENDING) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    darkBgColor = 'dark:bg-yellow-900';
    darkTextColor = 'dark:text-yellow-300';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    darkBgColor = 'dark:bg-green-900';
    darkTextColor = 'dark:text-green-300';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    darkBgColor = 'dark:bg-red-900';
    darkTextColor = 'dark:text-red-300';
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor} ${darkBgColor} ${darkTextColor}`}
    >
      {status}
    </span>
  );
}

// Helper for Article Status
function ArticleStatusBadge({ published }: { published: boolean }) {
     return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        published 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  let colors = '';
  switch (status) {
    case 'PENDING':
      colors = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      break;
    case 'IN_PROGRESS':
      colors = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      break;
    case 'COMPLETED':
      colors = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
    case 'CANCELLED':
      colors = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      break;
    default:
      colors = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors}`}>
      {status.replace('_', ' ')}
    </span>
  );
}


export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/forbidden');
  }

  // 1. Fetch data
  const totalUsers = await prisma.user.count();
  const totalArticles = await prisma.article.count();
  const publishedArticlesCount = await prisma.article.count({
    where: { published: true },
  });
  const allArticles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true, username: true, email: true } } },
  });
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, username: true, email: true, createdAt: true, role: true, canComment: true },
  });
  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const unreadMessagesCount = await prisma.contactMessage.count({
    where: { isRead: false },
  });
  const bloggerApplications = await prisma.bloggerApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true, username: true },
      },
    },
  });
  const pendingApplicationsCount = await prisma.bloggerApplication.count({
    where: { status: ApplicationStatus.PENDING },
  });
  const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
  });
  const allNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
          _count: {
              select: { userNotifications: true }
          }
      }
  });
  const totalComments = await prisma.comment.count();
  const allComments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, username: true, email: true } },
      article: { select: { title: true, slug: true } },
    },
    take: 50,
  });

  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' }});
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, username: true, email: true } }
    }
  });

  const activeOrders = await prisma.order.findMany({
    where: {
      OR: [
        { status: 'PENDING' },
        { status: 'IN_PROGRESS' },
        { messages: { some: { isReadByAdmin: false, sender: { role: { not: 'ADMIN' } } } } }
      ]
    },
    include: {
      author: { select: { name: true, username: true } },
      _count: {
        select: {
          // Count unread messages *from the user*
          messages: { where: { isReadByAdmin: false, sender: { role: { not: 'ADMIN' } } } }
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  // --- 2. Process Data for Charts ---
  
  // Daily Signups (Last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const signupsByDay = allUsers
    .filter(user => new Date(user.createdAt) > sevenDaysAgo)
    .reduce((acc, user) => {
      const day = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Create a map of the last 7 days
  const last7DaysMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7DaysMap.set(dayKey, signupsByDay[dayKey] || 0);
  }
  const dailySignups = Array.from(last7DaysMap, ([name, users]) => ({ name, users }));

  // Content Breakdown
  const contentBreakdown = [
    { name: 'Articles', count: totalArticles },
    { name: 'Comments', count: totalComments },
    { name: 'Categories', count: allCategories.length },
  ];

  // Application Status
  const approved = bloggerApplications.filter(a => a.status === 'APPROVED').length;
  const rejected = bloggerApplications.filter(a => a.status === 'REJECTED').length;
  const applicationData = [
    { name: 'PENDING', count: pendingApplicationsCount },
    { name: 'APPROVED', count: approved },
    { name: 'REJECTED', count: rejected },
  ].filter(d => d.count > 0);

  // --- End Data Processing ---


  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto space-y-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          Admin Control Panel
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Total Articles" value={totalArticles} />
          <StatCard title="Total Comments" value={totalComments} />
          <StatCard title="Total Orders" value={totalOrders} />
          <StatCard title="Pending Orders" value={pendingOrders} />
          <StatCard title="Pending Applications" value={pendingApplicationsCount} />
          <StatCard title="Unread Messages" value={unreadMessagesCount} />
          <StatCard title="Published Articles" value={publishedArticlesCount} />
        </div>

        {/* --- 3. Render the new Stats Component --- */}
        <AdminStats
            dailySignups={dailySignups}
            contentBreakdown={contentBreakdown}
            applicationData={applicationData}
        />
        
         {/* --- Category Management Section --- */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> Category Management </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h3>
                    <CategoryForm />
                </div>
                <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Existing Categories ({allCategories.length})</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {allCategories.length > 0 ? (
                                allCategories.map((category) => (
                                <li key={category.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{category.slug}</p>
                                    </div>
                                    <CategoryRowActions categoryId={category.id} categoryName={category.name} />
                                </li>
                                ))
                            ) : (
                                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">No categories created yet.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
         </div>
         
         {/* --- New Notification Section --- */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> Send Notification </h2>
             <SendNotificationForm allUsers={allUsers} />
         </div>

         {/* --- All Notifications Table --- */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Sent Notifications Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent To (Count)</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent At</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                allNotifications.length > 0 ? (
                  allNotifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={notif.title}>{notif.title}</div>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                         <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={notif.description}>{notif.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {notif.url ? (
                            <Link href={notif.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">View Link</Link>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">None</span>
                          )}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         {notif._count.userNotifications} user(s)
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         {new Date(notif.createdAt).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <NotificationRowActions notificationId={notif.id} notificationTitle={notif.title} />
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No notifications sent yet.</td></tr>
                )
              }</tbody></table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Active Order Messages</h2>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <li key={order.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Client: {order.author?.name || order.author?.username || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-3 sm:mt-0 flex-shrink-0">
                        <OrderStatusBadge status={order.status} />
                        <AdminOrderMessageButton orderId={order.id} unreadCount={order._count.messages} />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No active orders or messages.
                  </li>
                )}
              </ul>
            </div>
         </div>

        {/* --- 6. START: New Order Management Table --- */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Order Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                  allOrders.length > 0 ? (
                    allOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                           {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.author?.name || order.author?.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{order.author?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {order.category}
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                           <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={order.description}>{order.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.budget || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <OrderStatusBadge status={order.status} />
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <OrderRowActions order={order} />
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No orders found.</td></tr>
                  )
                }</tbody></table>
            </div>
         </div>
         {/* --- END: New Order Management Table --- */}

         {/* --- All Articles Management Table --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
           <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> Manage All Articles </h2>
           <div className="overflow-x-auto">
             <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                allArticles.length > 0 ? (
                  allArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={article.title}>{article.title}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{article.author?.name || article.author?.username || article.author?.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><ArticleStatusBadge published={article.published} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(article.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(article.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" title="View Article"> View </Link>
                        <Link href={`/dashboard/articles/edit/${article.slug}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Article"> Edit </Link>
                        <AdminArticleRowActions articleId={article.id} articleTitle={article.title} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"> No articles found. </td></tr>
                )
              }</tbody></table>
           </div>
        </div>

        {/* --- Start: Blogger Application Management Table --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> Blogger Applications </h2>
            <div className="overflow-x-auto">
             <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> Applicant </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> Reason </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> Topics </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> Sample </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"> Status </th><th scope="col" className="relative px-6 py-3 text-right"> Actions </th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                bloggerApplications.length > 0 ? (
                  bloggerApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{app.user?.name || app.user?.username || 'N/A'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{app.user?.email || 'N/A'}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs"> <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={app.reason}> {app.reason} </p> </td>
                      <td className="px-6 py-4 max-w-xs"> <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={app.topics}> {app.topics} </p> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"> {app.sampleUrl ? ( <a href={app.sampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View</a> ) : ( <span className="text-gray-400 dark:text-gray-500">None</span> )} </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <StatusBadge status={app.status} /> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> <BloggerApplicationRowActions application={app as ApplicationWithUser} /> </td>
                    </tr>
                  ))
                ) : (
                  <tr> <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"> No blogger applications received yet. </td> </tr>
                )
              }</tbody></table>
            </div>
        </div>

        {/* --- User Management Table --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> User Management </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comments</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.username || 'N/A'}</div> </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'N/A'}</div> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <span className={`px-2 py-0.5 rounded-full text-xs ${user.canComment ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                           {user.canComment ? 'Allowed' : 'Blocked'}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : user.role === 'BLOGGER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}> {user.role} </span> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <UserRowActions 
                            userId={user.id} 
                            currentRole={user.role} 
                            isCurrentUser={user.id === session.user.id} 
                            canComment={user.canComment}
                         />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No users found.</td></tr>
                )}
              </tbody></table>
            </div>
        </div>

        {/* --- Comment Management Table --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Recent Comments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comment</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">On Article</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                allComments.length > 0 ? (
                  allComments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 max-w-sm">
                         <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={comment.content}>{comment.content}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {comment.author?.name || comment.author?.username || 'N/A'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <Link href={`/blog/${comment.article.slug}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs" title={comment.article.title}>
                           {comment.article.title}
                         </Link>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         {new Date(comment.createdAt).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <CommentRowActions commentId={comment.id} commentContent={comment.content} />
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No comments found.</td></tr>
                )
              }</tbody></table>
          </div>
        </div>

        {/* --- Contact Message Management Table --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"> Contact Messages </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Received</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th><th scope="col" className="relative px-6 py-3 text-right">Actions</th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{
                contactMessages.length > 0 ? (
                  contactMessages.map((message) => (
                    <tr key={message.id} className={`${message.isRead ? 'opacity-70 dark:opacity-60' : 'font-semibold'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(message.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{message.name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><a href={`mailto:${message.email}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{message.email}</a></td>
                      <td className="px-6 py-4 max-w-sm">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={message.message}>
                            {message.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${message.isRead ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 animate-pulse'}`}> {message.isRead ? 'Read' : 'Unread'} </span> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ContactMessageRowActions message={message} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No contact messages received yet.</td></tr>
                )
              }</tbody></table>
            </div>
        </div>
      </div>
    </div>
  );
}

