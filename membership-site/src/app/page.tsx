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
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Transform your</span>{' '}
                  <span className="block text-cyan-900 xl:inline">sleep experience</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join thousands of users who have revolutionized their sleep patterns with our advanced sleep tracking and optimization platform. Get personalized insights and recommendations to improve your sleep quality.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/pricing"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium text-white bg-cyan-700 hover:bg-cyan-900 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/faq"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 md:py-4 md:text-lg md:px-10"
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
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-cyan-700 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for better sleep
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive sleep tracking platform provides all the tools you need to understand and improve your sleep patterns.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 bg-cyan-500 text-white">
                    📊
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Advanced Analytics</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Detailed sleep analytics and insights to help you understand your sleep patterns and identify areas for improvement.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 bg-cyan-500 text-white">
                    🎯
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Personalized Recommendations</h3>
                  <p className="mt-2 text-base text-gray-500">
                    AI-powered recommendations tailored to your specific sleep patterns and lifestyle to optimize your rest.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 bg-cyan-500 text-white">
                    📱
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Mobile App</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Access your sleep data and insights anywhere with our intuitive mobile application available on all devices.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 bg-cyan-500 text-white">
                    🔒
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Secure & Private</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Your sleep data is encrypted and secure. We prioritize your privacy and never share your personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-cyan-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to improve your sleep?</span>
            <span className="block">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-cyan-200">
            Join thousands of users who have already transformed their sleep experience with our platform.
          </p>
          <Link
            href="/pricing"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-cyan-700 bg-white hover:bg-cyan-50 sm:w-auto"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
