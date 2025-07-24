import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Pick what supports you
          </h1>
          <p className="mt-4 text-xl text-gray-600">
          Free or custom—both support your journey
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid gap-8 lg:grid-cols-2 lg:gap-x-8">
          {/* Free Plan */}
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900">Free Access</h3>
              <p className="mt-4 text-gray-600">
              Try SleepCoding at no cost
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  15 guided audio sessions
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  Voices, music, and environment presets
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  Sleep-friendly mobile app
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  Long-form sessions (10 hours+)
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white border-2 border-cyan-500 shadow-sm relative overflow-hidden">
           
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900">Premium Membership</h3>
              <p className="mt-4 text-gray-600">
              Go deeper with custom sessions and exclusive tools
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$58</span>
                <span className="text-base font-medium text-gray-500">/year</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
              Just $4.83/month — billed annually
              </p>
              <ul className="mt-8 space-y-4">
              <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  15 opportunities each year to create your own session
                  </p>
                </li>               <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                  Unused sessions roll over to next year (up to 150)
                  </p>
                </li>               
                
                 <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    15 guided audio sessions
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Voices, music, and environment presets
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Sleep-friendly mobile app
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">
                    Long-form sessions (10 hours+)
                  </p>
                </li>

              </ul>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-900"
                >
                  Start Premium Trial
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Membership Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your premium subscription at any time. You&apos;ll continue to have access to premium features until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Is there a free trial for the premium plan?
              </h3>
              <p className="text-gray-600">
              We don’t offer a traditional trial—but you don’t need one. The free plan gives you full access to 15 sessions, so you can experience how SleepCoding works and decide if premium is right for you.
              </p>
            </div>
            <div className="bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our payment partners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 