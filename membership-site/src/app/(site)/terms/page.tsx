import LegalContact from '@/components/LegalContact';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-6 sm:py-12 px-0 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md p-4 sm:p-8 rounded-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: {new Date().toLocaleDateString()}
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              These Terms & Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you&quot;) and Sleep Coder LLC, a limited liability company organized under the laws of the State of Maine, United States (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), governing your access to and use of the SleepCode mobile application, the sleepcoding.me website, and related services (collectively, the &quot;Service&quot;).
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              By downloading, installing, creating an account, or otherwise accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must immediately discontinue use of the Service.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Accounts & Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                1.1 The Service is intended for individuals 13 years of age or older. If you are under 18, you represent and warrant that you have obtained parental or guardian consent prior to using the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                1.2 Some free content may be accessible without account registration. However, creation of an account is required for subscription features, including the ability to create custom, private instructions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                1.3 You agree to provide accurate, current, and complete information during registration and to maintain the security of your login credentials. You are solely responsible for all activity occurring under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. License Grant and Restrictions
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                2.1 Subject to compliance with these Terms, Company grants you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to install and use the Service for personal, non-commercial purposes only.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                2.2 Except as expressly permitted, you shall not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>(a) copy, reproduce, modify, or distribute any part of the Service;</li>
                <li>(b) reverse-engineer, decompile, or disassemble the Service;</li>
                <li>(c) sell, sublicense, or otherwise exploit content generated through the Service for commercial purposes;</li>
                <li>(d) use the Service in a manner inconsistent with its intended purpose.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                2.3 Therapists, educators, or similar professionals may use the Service as a tool with their clients or students, provided that any generated content remains for personal or instructional use only and is not resold or distributed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Subscriptions, Billing, and Payments
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.1 Paid subscriptions are managed exclusively through the Apple App Store and Google Play using RevenueCat. All billing, renewals, and cancellations are subject to the terms of those platforms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.2 Free Access: Users may access a curated library of pre-created instructions without charge.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.3 Paid Access: A subscription unlocks the ability to generate custom, private instructions. Subscriptions automatically renew unless canceled in accordance with Apple or Google procedures.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.4 Refunds: Refunds are governed by Apple and Google policies. In addition, Company may, at its sole discretion, remove erroneously created instructions and credit the User&apos;s account to create replacements. This remedy is limited to a maximum of three (3) occurrences per calendar year and may not be abused.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                3.5 Cancellation:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>(a) Annual subscriptions, once canceled, remain active until the end of the paid term; no prorated refunds are issued.</li>
                <li>(b) User-generated content created under a paid subscription will remain associated with the User&apos;s account. If a subscription lapses and is later reactivated, such content will remain accessible for up to five (5) years after the initial cancellation date, after which it may be permanently deleted.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. User Conduct
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                4.1 You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>(a) use the Service for unlawful purposes or in violation of applicable law;</li>
                <li>(b) interfere with or disrupt the Service or its servers;</li>
                <li>(c) attempt to bypass or manipulate payment or access controls;</li>
                <li>(d) share, resell, or publicly distribute generated content.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                4.2 All user-generated content within the Service is private to the User and stored using best practices supported by Amazon Web Services (AWS).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                5.1 All rights, title, and interest in and to the Service, including software, code, text, images, audio, designs, and trademarks, are owned by Sleep Coder LLC and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                5.2 Users acquire no ownership rights by virtue of generating custom instructions. All generated content, whether pre-created or user-generated, remains the intellectual property of Sleep Coder LLC.
              </p>
              <p className="text-gray-700 leading-relaxed">
                5.3 Recording or duplicating Service content outside the app is permitted only for personal use. Any sale, redistribution, or public performance of such content is strictly prohibited.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Health and Safety Disclaimer
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                6.1 The Service is provided for purposes of relaxation, subconscious training, and self-improvement support. It is not a medical device and is not intended to diagnose, treat, cure, or prevent any medical or psychological condition.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                6.2 Company makes no representations or guarantees regarding specific results or outcomes. Individual experiences may vary.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                6.3 The Service should not be used while driving, operating machinery, or in any environment requiring alertness. Users must only engage with the Service in a safe and secure setting.
              </p>
              <p className="text-gray-700 leading-relaxed">
                6.4 Users should consult a licensed healthcare provider for any medical or mental health concerns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                7.1 Company reserves the right to immediately suspend or terminate User accounts, without refund, if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 leading-relaxed mb-4">
                <li>(a) the User violates these Terms;</li>
                <li>(b) fraudulent or abusive activity is detected;</li>
                <li>(c) continued use would expose Company to legal or security risk.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                8.1 To the maximum extent permitted by law, Company shall not be liable for any indirect, incidental, consequential, or punitive damages, including but not limited to loss of profits, personal injury, or reliance on Service outcomes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                8.2 In no event shall Company&apos;s aggregate liability exceed the total fees paid by the User in the twelve (12) months preceding the claim. For annual subscriptions, liability shall be proportionally limited to the unused portion of the subscription term.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed under the laws of the United States of America, without regard to conflict-of-law principles. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of U.S. federal and state courts.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Modifications
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Company reserves the right to amend these Terms at any time. Material changes will be communicated via email. Continued use of the Service after such changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <LegalContact />
          </div>
        </div>
      </div>
    </div>
  );
}
