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
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ApplicationWithUser } from './BloggerApplicationModal';

// ... (Helper functions StatCard, StatusBadge, ArticleStatusBadge remain the same) ...
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
function StatusBadge({ status }: { status: ApplicationStatus }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  if (status === ApplicationStatus.PENDING) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800 animate-pulse';
  } else if (status === ApplicationStatus.APPROVED) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (status === ApplicationStatus.REJECTED) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
}
function ArticleStatusBadge({ published }: { published: boolean }) {
     return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {published ? 'Published' : 'Draft'}
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
    take: 50, // Paginate or limit initial fetch
  });


  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl w-full mx-auto space-y-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Admin Control Panel
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Total Articles" value={totalArticles} />
          <StatCard
            title="Published Articles"
            value={publishedArticlesCount}
          />
           <StatCard title="Total Comments" value={totalComments} />
          <StatCard title="Unread Messages" value={unreadMessagesCount} />
          <StatCard
            title="Pending Applications"
            value={pendingApplicationsCount}
          />
        </div>
        
         {/* --- Category Management Section --- */}
         <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"> Category Management </h2> <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> <div className="md:col-span-1"> <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3> <CategoryForm /> </div> <div className="md:col-span-2"> <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Categories ({allCategories.length})</h3> <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto"> <ul className="divide-y divide-gray-200"> {allCategories.length > 0 ? ( allCategories.map((category) => ( <li key={category.id} className="px-4 py-3 flex items-center justify-between"> <div> <p className="text-sm font-medium text-gray-900">{category.name}</p> <p className="text-xs text-gray-500">{category.slug}</p> </div> <CategoryRowActions categoryId={category.id} categoryName={category.name} /> </li> )) ) : ( <li className="px-4 py-3 text-sm text-gray-500 text-center">No categories created yet.</li> )} </ul> </div> </div> </div>
         </div>
         
         {/* --- New Notification Section --- */}
         <div className="bg-white p-6 rounded-lg shadow-lg">
             <h2 className="text-2xl font-bold text-gray-800 mb-6"> Send Notification </h2> <SendNotificationForm allUsers={allUsers} />
         </div>

         {/* --- All Notifications Table --- */}
         <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Sent Notifications Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent To (Count)</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                allNotifications.length > 0 ? (
                  allNotifications.map((notif) => (
                    <tr key={notif.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={notif.title}>{notif.title}</div>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                         <p className="text-sm text-gray-700 truncate" title={notif.description}>{notif.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {notif.url ? (
                            <Link href={notif.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">View Link</Link>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {notif._count.userNotifications} user(s)
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {new Date(notif.createdAt).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <NotificationRowActions notificationId={notif.id} notificationTitle={notif.title} />
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No notifications sent yet.</td></tr>
                )
              }</tbody></table>
          </div>
        </div>

         {/* --- All Articles Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
           <h2 className="text-2xl font-bold text-gray-800 mb-6"> Manage All Articles </h2>
           <div className="overflow-x-auto">
             <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                allArticles.length > 0 ? (
                  allArticles.map((article) => (
                    <tr key={article.id}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={article.title}>{article.title}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{article.author?.name || article.author?.username || article.author?.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><ArticleStatusBadge published={article.published} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(article.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900" title="View Article"> View </Link>
                        <Link href={`/dashboard/articles/edit/${article.slug}`} className="text-blue-600 hover:text-blue-900" title="Edit Article"> Edit </Link>
                        <AdminArticleRowActions articleId={article.id} articleTitle={article.title} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500"> No articles found. </td></tr>
                )
              }</tbody></table>
           </div>
        </div>

        {/* --- Start: Blogger Application Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"> Blogger Applications </h2>
            <div className="overflow-x-auto">
             <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Applicant </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Reason </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Topics </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Sample </th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Status </th><th scope="col" className="relative px-6 py-3 text-right"> Actions </th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                bloggerApplications.length > 0 ? (
                  bloggerApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.user?.name || app.user?.username || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{app.user?.email || 'N/A'}</div>
                        <div className="text-xs text-gray-400 mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs"> <p className="text-sm text-gray-700 truncate" title={app.reason}> {app.reason} </p> </td>
                      <td className="px-6 py-4 max-w-xs"> <p className="text-sm text-gray-700 truncate" title={app.topics}> {app.topics} </p> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"> {app.sampleUrl ? ( <a href={app.sampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a> ) : ( <span className="text-gray-400">None</span> )} </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <StatusBadge status={app.status} /> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> <BloggerApplicationRowActions application={app as ApplicationWithUser} /> </td>
                    </tr>
                  ))
                ) : (
                  <tr> <td colSpan={6} className="px-6 py-4 text-center text-gray-500"> No blogger applications received yet. </td> </tr>
                )
              }</tbody></table>
            </div>
        </div>

        {/* --- User Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"> User Management </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                allUsers.length > 0 ? (
                  allUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm font-medium text-gray-900">{user.name || user.username || 'N/A'}</div> </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <div className="text-sm text-gray-500">{user.email || 'N/A'}</div> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <span className={`px-2 py-0.5 rounded-full text-xs ${user.canComment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {user.canComment ? 'Allowed' : 'Blocked'}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : user.role === 'BLOGGER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}> {user.role} </span> </td>
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
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
                )}
              </tbody></table>
            </div>
        </div>

        {/* --- Comment Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recent Comments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Article</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                allComments.length > 0 ? (
                  allComments.map((comment) => (
                    <tr key={comment.id}>
                      <td className="px-6 py-4 max-w-sm">
                         <p className="text-sm text-gray-700 truncate" title={comment.content}>{comment.content}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {comment.author?.name || comment.author?.username || 'N/A'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <Link href={`/blog/${comment.article.slug}`} className="text-sm text-blue-600 hover:underline truncate max-w-xs" title={comment.article.title}>
                           {comment.article.title}
                         </Link>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {new Date(comment.createdAt).toLocaleString()}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <CommentRowActions commentId={comment.id} commentContent={comment.content} />
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No comments found.</td></tr>
                )
              }</tbody></table>
          </div>
        </div>

        {/* --- Contact Message Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"> Contact Messages </h2>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th scope="col" className="relative px-6 py-3 text-right">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{
                contactMessages.length > 0 ? (
                  contactMessages.map((message) => (
                    <tr key={message.id} className={message.isRead ? 'opacity-70' : 'font-semibold'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{message.name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><a href={`mailto:${message.email}`} className="text-sm text-blue-600 hover:underline">{message.email}</a></td>
                      <td className="px-6 py-4 max-w-sm">
                        <p className="text-sm text-gray-700 truncate" title={message.message}>
                            {message.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${message.isRead ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800 animate-pulse'}`}> {message.isRead ? 'Read' : 'Unread'} </span> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ContactMessageRowActions message={message} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No contact messages received yet.</td></tr>
                )
              }</tbody></table>
            </div>
        </div>
      </div>
    </div>
  );
}

