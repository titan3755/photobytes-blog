import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | PhotoBytes Blog',
  description: 'Learn more about the team and mission behind PhotoBytes Blog.',
};

export default function AboutPage() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 min-h-screen min-w-screen flex flex-col items-center justify-center ">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            About PhotoBytes
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Technology, photography, and development, all in one byte.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="mt-12 text-lg text-gray-700 space-y-6">
          <p>
            Welcome to PhotoBytes Blog, the official blog for{' '}
            <a
              href="https://photobytes-reworked.vercel.app/"
              className="text-blue-600 hover:underline font-medium"
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

          {/* Image Placeholder */}
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center my-8">
            <span className="text-gray-500">
              <Image
                src="https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg" // Placeholder image path
                alt="About PhotoBytes"
                width={400}
                height={200}
              />
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 pt-4">Our Team</h2>
          <p>
            PhotoBytes is run by a small, dedicated team. We believe in the power
            of sharing knowledge and building a community. While we may be small,
            our ambitions are large, and we're excited to grow with you.
          </p>

          {/* Team Members Section */}
          <div className="space-y-8">
            {/* Mahmud Al Muhaimin */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="h-16 w-16 rounded-full"
                  src="/final.svg" // Placeholder, use an actual team member photo
                  alt="Team member"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Mahmud Al Muhaimin
                </h3>
                <p className="text-gray-500">Co-founder and Lead Developer</p>
              </div>
            </div>

            {/* Adib Azwad */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Image
                  className="h-16 w-16 rounded-full"
                  src="/final.svg" // Placeholder, use an actual team member photo
                  alt="Team member"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Adib Azwad
                </h3>
                <p className="text-gray-500">Co-founder and Lead Designer</p>
              </div>
            </div>
          </div>
          {/* End Team Members Section */}

          <h2 className="text-3xl font-bold text-gray-900 pt-4">Join Us</h2>
          <p>
            We're always looking for new perspectives. If you're interested in
            writing for us, or just want to share your feedback, don't hesitate
            to{' '}
            <Link
              href="/contact"
              className="text-blue-600 hover:underline font-medium"
            >
              get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}