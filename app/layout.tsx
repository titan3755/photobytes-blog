import type { Metadata } from 'next';
import { Share_Tech } from 'next/font/google';
import './globals.css';
import Header from '../components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthProvider from './providers'; // This should contain ThemeProvider

const share_tech = Share_Tech({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PhotoBytes Blog',
  description: 'The blog website of PhotoBytes Studios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. Add suppressHydrationWarning
    <html lang="en" suppressHydrationWarning>
      {/* 2. Apply theme-switching classes to <body> */}
      <body
        className={`${share_tech.className} antialiased flex flex-col min-h-screen mx-auto 
                   bg-white text-gray-900 
                   dark:bg-gray-900 dark:text-gray-100 
                   transition-colors duration-200 overflow-x-hidden`}
      >
        <AuthProvider>
          <Header />
          {/* 3. Main inherits theme from body */}
          <main className="mx-auto flex-grow w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

