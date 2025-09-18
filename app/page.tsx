import type { Metadata } from 'next';
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description: 'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-black">
        Superblog (Photobytes)
      </h1>
      <ol className="list-decimal list-inside text-black">
        {users.map((user) => (
          <li key={user.id} className="mb-2 text-black">
            {user.email}
          </li>
        ))}
      </ol>
    </div>
  )
}
