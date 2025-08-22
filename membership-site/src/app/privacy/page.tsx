import LegalContact from '@/components/LegalContact';

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-6 sm:py-12 px-0 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm p-4 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: {new Date().toLocaleDateString()}
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              This Privacy Policy describes how Sleep Coder LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, stores, and protects your information when you access or use the SleepCode mobile application, the sleepcoding.me website, and related services (collectively, the &quot;Service&quot;).
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              By using the Service, you acknowledge that you have read and understood this Privacy Policy.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Personal Information Provided by You</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Email address – required for account creation and login.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Name and payment information – processed for subscriptions, administered by RevenueCat in conjunction with Stripe, Apple App Store, and Google Play.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Content Data</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Publicly available tracks – we collect aggregated usage data (e.g., which free instructions are accessed and how often).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Private instructions – no analytics or usage tracking is collected on private content.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                On the website, we use cookies to manage user sessions and basic analytics to identify weak points in the user interface.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                No advertising cookies or third-party ad tracking are employed.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Within the app, we do not use analytics or advertising tracking tools.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Purpose of Processing
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We process your information solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>To provide authentication, account management, and subscription services.</li>
                <li>To process subscription payments via RevenueCat, Stripe, Apple, and Google.</li>
                <li>To maintain and improve the Service, including analyzing aggregated usage of publicly available tracks.</li>
                <li>To ensure security and fraud prevention.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We do not use your data for marketing or advertising purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Sharing of Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell or rent your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not share information with advertisers or third-party marketers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Information may be shared only with trusted service providers that are necessary to operate the Service, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>Firebase (Google) – authentication, session management, and data storage.</li>
                <li>RevenueCat / Stripe / Apple / Google – subscription and payment processing.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These providers are bound by contractual and legal obligations to safeguard your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Storage and Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                User data is stored using Google Firebase authentication and database services.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Passwords and credentials are encrypted using Firebase&apos;s standard hashing and security protocols.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                All communication with the Service is encrypted using HTTPS / SSL/TLS.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Private user-generated audio content is protected with encryption-based access controls.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Access to user data is restricted to authorized personnel only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. User Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your jurisdiction, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li><strong>Access</strong> – request a copy of your personal data.</li>
                <li><strong>Correction</strong> – request correction of inaccurate data.</li>
                <li><strong>Deletion</strong> – request deletion of your account and associated data.</li>
                <li><strong>Portability</strong> – request transfer of your data to another service provider.</li>
                <li><strong>Opt-out</strong> – request to opt out of non-essential data processing.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Requests must be made via email to contact@sleepcoding.me.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We will confirm and execute deletion requests within 72 hours whenever technically feasible. A confirmation email will be sent upon completion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Account and subscription data is retained until you request deletion of your account.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>User-generated content (private instructions):</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>If a subscription is canceled, content will be retained for five (5) years unless you specifically request immediate deletion at the time of cancellation.</li>
                <li>If no request is made, content is automatically purged after five years.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Aggregated analytics regarding free/public instructions are retained indefinitely but are not linked to individual users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service is not directed to children under the age of 13, and we do not knowingly collect personal data from children under 13.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If we become aware that we have inadvertently collected such data, we will delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. International Users
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.1 EU/UK Users (GDPR)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are located in the European Union or United Kingdom, you have additional rights under the GDPR, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>Right to object to certain processing.</li>
                <li>Right to lodge a complaint with a data protection authority.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                The legal basis for our processing includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>Performance of a contract (providing the Service).</li>
                <li>Compliance with legal obligations.</li>
                <li>Legitimate interests (service improvement and security).</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">8.2 California Users (CCPA)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a California resident, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>Request disclosure of the categories and specific pieces of data we collect.</li>
                <li>Request deletion of your personal data.</li>
                <li>Opt out of any &quot;sale&quot; of personal data.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We do not &quot;sell&quot; user data as defined by the CCPA. In the event of a company sale or transfer, user data may be transferred as part of the transaction, subject to notice and continued protection under this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your data may be processed and stored in the United States, where privacy laws may differ from those in your country of residence. By using the Service, you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. If material changes are made, we will notify you by email or through the Service. Continued use after such changes constitutes acceptance of the revised policy.
              </p>
            </section>

            <LegalContact />
          </div>
        </div>
      </div>
    </div>
  );
} 