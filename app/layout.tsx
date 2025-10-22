import type { Metadata } from 'next';
import { Share_Tech } from 'next/font/google';
import "./globals.css";
import Header from '../components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthProvider from './providers'; // 1. Import the provider

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
    <html lang="en" className="bg-white min-w-screen mx-auto">
      <body
        className={`${share_tech.className} antialiased flex flex-col min-h-screen mx-auto bg-white`}
      >
        {/* 2. Wrap your layout components with the provider */}
        <AuthProvider>
          <Header />
          <main className="mx-auto flex-grow bg-white">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}