import LegalContact from '@/components/LegalContact';

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-6 sm:py-12 px-0 sm:px-6 lg:px-8">
      <div className="bg-white shadow-md p-4 sm:p-8 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            Cookie Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: {new Date().toLocaleDateString()}
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              This Cookie Policy explains how Sleep Coder LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies when you use the SleepCode mobile application and the sleepcoding.me website (the &quot;Service&quot;).
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files placed on your device to store information. Cookies are widely used to enable websites and applications to function properly, to enhance user experience, and to provide basic security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. How We Use Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies strictly for the following purpose:
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Essential Session Management:</strong> Cookies are required to keep you logged in and maintain secure sessions while you use the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not use cookies for advertising, marketing, or tracking across third-party websites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Analytics
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect aggregated analytics regarding the usage of publicly available tracks. These analytics are performed through AWS server logs and do not use cookies or identify individual users.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Private, user-generated instructions are not tracked.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Managing Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Because our cookies are strictly necessary for login and security, they cannot be disabled through our Service. You may configure your browser to block or delete cookies, but doing so may prevent you from logging in or using key features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Updates
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time. Changes will be posted on this page with a new &quot;Effective Date.&quot;
              </p>
            </section>

            <LegalContact sectionNumber={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
