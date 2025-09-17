import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | PhotoBytes Studios',
  description: 'Welcome to the PhotoBytes Blog, your source for the latest news and updates.',
};

export default function Home() {
  return (
    <div className="bg-white min-h-screen w-screen">
      <main>
        <h1 className="text-2xl font-bold text-center py-12 text-black text-wrap">Welcome to PhotoBytes Blog</h1>
      </main>
    </div>
  )
}
