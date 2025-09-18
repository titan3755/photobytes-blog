import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from '../components/common/Navbar';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased flex flex-col min-h-screen mx-auto bg-white`}>
        <Header />
        <main className="mx-auto flex-grow bg-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}