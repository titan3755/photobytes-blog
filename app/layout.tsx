import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/common/Navbar';
import Footer from '@/components/common/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoBytes Blog",
  description: "The blog website of PhotoBytes Studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white mx-auto">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen mx-auto bg-white`}>
        <Header />
        <main className="mx-auto flex-grow bg-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}