import type { Metadata } from 'next';
import Image from 'next/image'; // Keep this for the Pexels image
import Link from 'next/link';
import { PenTool } from 'lucide-react'; // Import icons

export const metadata: Metadata = {
  title: 'About Us | PhotoBytes Blog',
  description: 'Learn more about the team and mission behind PhotoBytes Blog.',
};

export default function AboutPage() {
  return (
    // 1. Removed "bg-white" to allow theme from layout to apply.
    // Added padding for spacing from header/footer.
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-w-screen">
      
      {/* --- 2. New Hero Section --- */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">
          About PhotoBytes
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          Technology, photography, and development, all in one byte.
        </p>
      </div>

      {/* --- 3. Main Content Section with Prose --- */}
      <div className="mt-20 max-w-3xl mx-auto">
        {/* Using Tailwind 'prose' provides beautiful typography out of the box.
          'prose-invert' automatically handles all dark mode text/link colors.
        */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-img:shadow-md">
          <p>
            Welcome to PhotoBytes Blog, the official blog for{' '}
            <a
              href="https://photobytes-reworked.vercel.app/"
              className="font-medium" // Prose handles the color/hover
              target="_blank"
              rel="noopener noreferrer"
            >
              PhotoBytes Studios
            </a>
            . We are a passionate team of creators, developers, and photography
            enthusiasts dedicated to exploring the intersection of technology and
            art.
          </p>
          <p>
            Our mission is to provide high-quality tutorials, insightful
            articles, and inspiring content for everyone, from beginners just
            starting with their first camera to seasoned developers looking for
            the latest in web technology.
          </p>

          {/* Image (Pexels image is fine with next/image as it's a static URL in code) */}
          <div className="relative w-full aspect-video my-12">
            <Image
              src="https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg"
              alt="PhotoBytes team working"
              fill
              className="object-cover"
              priority // Prioritize loading this large image
            />
          </div>

          <h2>Our Team</h2>
          <p>
            PhotoBytes is run by a small, dedicated team. We believe in the power
            of sharing knowledge and building a community. While we may be small,
            our ambitions are large, and we&apos;re excited to grow with you.
          </p>

          {/* --- 4. Team Members Section (as Cards) --- */}
          {/* We use 'not-prose' to break out of the typography styles */}
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            {/* Mahmud Al Muhaimin */}
            <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0">
                {/* --- START FIX: Changed to <img> tag --- */}
                <img
                  className="h-16 w-16 rounded-full object-cover" // Tailwind handles size
                  src="https://scontent.fdac45-1.fna.fbcdn.net/v/t39.30808-6/460079671_1545332019705464_2675145164457896144_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEPvoUp_XdtgpXwuG5m5c12LVImEpoCX54tUiYSmgJfnmof6jFCICQxsY_kJt-MRG7kyMI2icMRinmXsaSCHkxz&_nc_ohc=_LEo7i_8xD0Q7kNvwG4Zg4I&_nc_oc=Adl6scmH2Z3A9ZRUwGrFXFZ5ACYB57yPW50fs_6jkXEp5vYfT3ai8a8ScZ67ggvyfBY&_nc_zt=23&_nc_ht=scontent.fdac45-1.fna&_nc_gid=JO8VIKAuA1eRCP5ziGqYhw&oh=00_AfdEiZk96ttnMpi934hyqOawrIkISdla3Sh7JRCnB8VbIw&oe=69041CB8"
                  alt="Mahmud Al Muhaimin"
                  referrerPolicy="no-referrer" // Added for privacy/loading from FB
                />
                {/* --- END FIX --- */}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mahmud Al Muhaimin
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Co-founder & Lead Developer</p>
              </div>
            </div>

            {/* Adib Azwad */}
            <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0">
                 {/* --- START FIX: Changed to <img> tag --- */}
                <img
                  className="h-16 w-16 rounded-full object-cover" // Tailwind handles size
                  src="https://scontent.fdac45-1.fna.fbcdn.net/v/t39.30808-6/477943712_1336481487481802_1651012146324337988_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGJgv2vRHXxekpKwnWOsAicknerg8LScbGSd6uDwtJxsUB1Oeq0DLZmxRuKMFI3LCo8Do_aVCnY-mttwJhboCGi&_nc_ohc=msseH9T4EYAQ7kNvwHvn4L3&_nc_oc=AdmodLBVzRXvb6uHyx2P-rw9W9RmIonDoQZRdvsjpQML5VIn6dfaS0Ly8EiWBNWKpo0&_nc_zt=23&_nc_ht=scontent.fdac45-1.fna&_nc_gid=nYVH_qsptKVJQg_jDWHEkw&oh=00_AfcfwPPnjmugR6UXh8vV8cCwhJMnabz5C2RXz7ggyK-7yA&oe=6904202F"
                  alt="Adib Azwad"
                  referrerPolicy="no-referrer" // Added for privacy/loading from FB
                />
                 {/* --- END FIX --- */}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Adib Azwad
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Co-founder & Lead Designer</p>
              </div>
            </div>
          </div>
          {/* --- End Team Members Section --- */}

        </div>
      </div>

      {/* --- 5. "Join Us" Call-to-Action Section --- */}
      <section className="max-w-3xl mx-auto mt-20">
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <PenTool className="h-12 w-12 text-white mx-auto" />
            <h2 className="text-3xl font-bold text-white mt-6">
              Want to Join Us?
            </h2>
            <p className="text-lg text-blue-100 mt-4 max-w-xl mx-auto">
              We&apos;re always looking for new perspectives. If you&apos;re interested in
              writing for us, or just want to share your feedback, don&apos;t hesitate
              to get in touch.
            </p>
            <Link
                href="/contact"
                className="mt-8 inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            >
                Contact Us
            </Link>
        </div>
      </section>

    </div>
  );
}