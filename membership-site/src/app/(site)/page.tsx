import Link from 'next/link';

export default function HomePage() {
  // Debug environment variables
  console.log('Environment check:', {
    hasFirebaseKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });

  // Simple test to see if the page loads at all
  if (typeof window !== 'undefined') {
    console.log('Page is loading in browser');
  }

  return (
            <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Train your mind</span>{' '}
                  <span className="block text-[#4e88dd] xl:inline"> while you sleep</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Your sleep can support meaningful change. SleepCoding pairs affirming language with calming sound environments to help ease you into sleep while planting the seeds of healthier thinking and behavior.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/pricing"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium text-white bg-[#4e88dd] hover:bg-[#31548a] md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/faq"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium text-white bg-[#340c35] hover:bg-[#000000] md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
              <div className="py-6 sm:py-12 sm:bg-white border-t border-[#c2c8cf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-cyan-700 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Change your mindset in your sleep
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Get started with 15 free sessions designed to support rest and shift your perspective. 
            Upgrade for <em>custom</em> sessions—your topics, your intention.
 
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div>
                <h3 className="text-xl leading-7 font-bold text-cyan-900 border-l-4 border-cyan-500 pl-4">15 Free Sessions</h3>
                <p className="mt-2 text-base text-gray-500">
                Explore themes like wellness, meditation, and mood—each one crafted to help you rest and reset.
                </p>
              </div>

              <div>
                <h3 className="text-xl leading-7 font-bold text-cyan-900 border-l-4 border-cyan-500 pl-4">Build Your Own</h3>
                <p className="mt-2 text-base text-gray-500">
                Subscribers get 15 custom sessions per year. Mix your own affirmations, voices, and background audio to match your personal goals.
                </p>
              </div>

              <div>
                <h3 className="text-xl leading-7 font-bold text-cyan-900 border-l-4 border-cyan-500 pl-4">Designed for Mobile</h3>
                <p className="mt-2 text-base text-gray-500">
                All sessions are available in the mobile app—easy to access, easy to use, and always in your pocket.
                </p>
              </div>

              <div>
                <h3 className="text-xl leading-7 font-bold text-cyan-900 border-l-4 border-cyan-500 pl-4">Privacy Built In</h3>
                <p className="mt-2 text-base text-gray-500">
                Your sessions are private, secure, and ad-free. No tracking, no interruptions—just space to recharge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#465362]">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block mb-2">Ready to shift your mindset?</span>
            <span className="block">Free accounts available.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-white">
            Join thousands of users who have already transformed<br/>their sleep experience with our method.
          </p>
          <Link
            href="/pricing"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#b6e3f6] hover:bg-[#b6e3f6] hover:text-[#465362] sm:w-auto"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
