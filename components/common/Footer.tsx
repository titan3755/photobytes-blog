import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-white shadow-sm py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <Image
              src="/final.svg"
              alt="PhotoBytes Studios logo"
              width={32}
              height={32}
              className="h-8 w-8"
              unoptimized={true}
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-black">
              PhotoBytes Blog
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/about" className="hover:underline me-4 md:me-6">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline me-4 md:me-6">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/licensing" className="hover:underline me-4 md:me-6">
                Licensing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{' '}
          <a href="https://photobytes-reworked.vercel.app/" className="hover:underline">
            PhotoBytes Studios
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};