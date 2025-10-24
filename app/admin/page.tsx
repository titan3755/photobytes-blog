import prisma from '@/lib/prisma';
import {
  Article,
  User,
  ContactMessage,
  Role,
  BloggerApplication, // Import BloggerApplication
  ApplicationStatus, // Import ApplicationStatus
} from '@prisma/client';
import UserRowActions from './UserRowActions';
import ContactMessageRowActions from './ContactMessageRowActions';
import BloggerApplicationRowActions from './BloggerApplicationRowActions'; // Import the new component
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Import Link

// Helper function to render stat cards
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Helper for status badges
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

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/forbidden');
  }

  // 1. Fetch data
  const totalUsers = await prisma.user.count();
  const totalArticles = await prisma.article.count();
  const publishedArticles = await prisma.article.count({
    where: { published: true },
  });
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
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

  return (
    // Adjusted padding/centering for better page flow
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8 min-w-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
          Admin Control Panel
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {' '}
          {/* Adjusted grid for responsiveness */}
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Total Articles" value={totalArticles} />
          <StatCard title="Published Articles" value={publishedArticles} />
          <StatCard title="Unread Messages" value={unreadMessagesCount} />
          <StatCard
            title="Pending Applications"
            value={pendingApplicationsCount}
          />
        </div>

        {/* --- Start: Blogger Application Management Table --- */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Blogger Applications
          </h2>
          {/* Keep overflow-x-auto for smaller screens where horizontal scroll might still be needed */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              {/* No whitespace or comments directly inside table */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applied At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Applicant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Topics
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sample
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bloggerApplications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {app.user?.name || app.user?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${app.user?.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {app.user?.email || 'N/A'}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal break-words">
                      {app.reason}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal break-words">
                      {app.topics}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.sampleUrl ? (
                        <a
                          href={app.sampleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <BloggerApplicationRowActions
                        applicationId={app.id}
                        userId={app.userId}
                        currentStatus={app.status}
                      />
                    </td>
                  </tr>
                ))}
                {bloggerApplications.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No blogger applications received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* --- End: Blogger Application Management Table --- */}

        {/* User Management Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            User Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              {/* No whitespace or comments directly inside table */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'BLOGGER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <UserRowActions
                        userId={user.id}
                        currentRole={user.role}
                        isCurrentUser={user.id === session.user.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Message Management Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Contact Messages
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              {/* No whitespace or comments directly inside table */}
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Received
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Message
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contactMessages.map((message) => (
                  <tr
                    key={message.id}
                    className={message.isRead ? 'opacity-70' : 'font-semibold'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`mailto:${message.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {message.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-normal break-words">
                      {message.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          message.isRead
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800 animate-pulse'
                        }`}
                      >
                        {message.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ContactMessageRowActions
                        messageId={message.id}
                        isRead={message.isRead}
                      />
                    </td>
                  </tr>
                ))}
                {contactMessages.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No contact messages received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}