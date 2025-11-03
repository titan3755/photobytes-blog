import type { Metadata } from 'next';
import { Share_Tech } from 'next/font/google';
import './globals.css';
import Header from '../components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthProvider from './providers'; // This should contain ThemeProvider
import ReCaptchaProvider from '@/components/security/ReCaptchaProvider';

const share_tech = Share_Tech({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

// --- START: Enhanced Metadata ---
export const metadata: Metadata = {
  // This is the base URL for your website
  metadataBase: new URL('https://photobytes-blog.vercel.app'),
  
  title: {
    default: 'PhotoBytes Blog | Tech, Photography, and Development',
    template: '%s | PhotoBytes Blog', // Creates "Page Title | PhotoBytes Blog"
  },
  description: 'The official blog for PhotoBytes Studios, covering high-quality tech, photography, and development tutorials and insights.',
  
  // Open Graph (Social Media)
  openGraph: {
    title: 'PhotoBytes Blog',
    description: 'Tech, photography, and development tutorials and insights.',
    url: 'https://photobytes-blog.vercel.app',
    siteName: 'PhotoBytes Blog',
    // You MUST create this file.
    // Create a 1200x630px image and save it as /public/og-image.png
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter (X)
  twitter: {
    card: 'summary_large_image',
    title: 'PhotoBytes Blog',
    description: 'Tech, photography, and development tutorials and insights.',
    images: ['/og-image.png'],
  },
};
// --- END: Enhanced Metadata ---

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
        <ReCaptchaProvider>
          <AuthProvider>
            <Header />
            {/* 3. Main inherits theme from body */}
            <main className="mx-auto flex-grow w-full pt-24">{children}</main>
            <Footer />
          </AuthProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}

