import ArticleLayout from '@/components/site/ArticleLayout';
import LegalContact from '@/components/LegalContact';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/site';

export default function PrivacyPage() {
  return (
    <ArticleLayout eyebrow="Privacy" title="Privacy Policy" byline={`Effective ${LEGAL_EFFECTIVE_DATE}`}>
      <div className="sc-prose">
        <p>
          This Privacy Policy explains how Sleep Coder LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects,
          uses, and protects information when you use SleepCode at sleepcoding.me (the &quot;Service&quot;).
        </p>
        <p>
          The short version: we collect as little as we can. You can listen to the free session without an account. We
          don&rsquo;t run ads, we don&rsquo;t use analytics or third-party trackers, and we don&rsquo;t sell your data.
        </p>

        <section>
          <h2>1. Information We Collect</h2>

          <h3>1.1 If you create an account</h3>
          <ul>
            <li>
              <strong>Email address</strong>, used to sign you in and to contact you about your account.
            </li>
            <li>
              <strong>Password</strong>, if you sign up with email. It is stored in hashed form by our authentication
              provider. We never see it.
            </li>
            <li>
              <strong>Name and profile photo</strong>, only if you sign in with Google, Apple, or Facebook and that
              provider shares them.
            </li>
            <li>
              <strong>Account records</strong>, such as when the account was created and whether your email is
              verified.
            </li>
          </ul>

          <h3>1.2 If you contact us</h3>
          <p>
            When you use the contact form or email us, we receive your name, email address, and message so we can reply.
          </p>

          <h3>1.3 Stored on your device</h3>
          <p>
            Your player settings (Instruction / Pulse balance, repeats, session length, and volume) and the last session
            you played are saved in your browser&rsquo;s local storage. This lets the player remember your choices without
            an account. It stays on your device, and you can clear it at any time in your browser settings.
          </p>

          <h3>1.4 Collected automatically</h3>
          <p>
            Like most websites, our hosting and audio-delivery providers keep standard server logs (for example, IP
            address, browser type, and the time of a request) to deliver the Service and keep it secure. We don&rsquo;t
            use these logs to build profiles of individual listeners.
          </p>

          <h3>1.5 Payments</h3>
          <p>
            SleepCode is currently free. If we offer paid plans, payments will be handled by Stripe. We never see or store
            your full card details.
          </p>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <ul>
            <li>To provide the Service, including signing you in and remembering your settings.</li>
            <li>To reply to your messages and send essential account emails (such as email verification or password reset).</li>
            <li>To keep the Service secure and prevent abuse.</li>
          </ul>
          <p>We do not use your information for advertising, and we don&rsquo;t send marketing email without your consent.</p>
        </section>

        <section>
          <h2>3. Service Providers</h2>
          <p>
            We don&rsquo;t sell or rent personal information. We share it only with providers that are needed to run the
            Service, and only for that purpose:
          </p>
          <ul>
            <li>Google Firebase: sign-in and account storage.</li>
            <li>Amazon Web Services: audio delivery (CloudFront) and email (SES).</li>
            <li>Vercel: website hosting.</li>
            <li>Stripe: payment processing, if paid plans are offered.</li>
            <li>Google, Apple, or Facebook: only if you choose to sign in with them.</li>
          </ul>
        </section>

        <section>
          <h2>4. Security</h2>
          <p>
            All connections to the Service use HTTPS. Passwords are hashed by our authentication provider. Session audio
            is delivered through time-limited, signed links. Access to account data is limited to what&rsquo;s needed to run
            the Service.
          </p>
        </section>

        <section>
          <h2>5. Your Choices and Rights</h2>
          <ul>
            <li>
              <strong>Delete your account</strong> at any time in Account &rsaquo; Delete account. This removes your
              account and its records.
            </li>
            <li>
              <strong>Access or correct</strong> your information by emailing us.
            </li>
            <li>
              <strong>Clear device data</strong> by clearing your browser&rsquo;s storage for sleepcoding.me.
            </li>
          </ul>
          <p>Depending on where you live, you may have additional rights, described in section 8.</p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We keep account information until you delete your account. Contact messages are kept as long as needed to
            handle your request. Server logs are kept for a limited period by our providers.
          </p>
        </section>

        <section>
          <h2>7. Children</h2>
          <p>
            The Service is not directed to children under 13, and we do not knowingly collect personal information from
            them. If we learn that we have, we will delete it.
          </p>
        </section>

        <section>
          <h2>8. Regional Rights</h2>
          <h3>8.1 EU and UK</h3>
          <p>
            If you are in the European Union or United Kingdom, you have rights under the GDPR, including access,
            correction, deletion, portability, objection, and the right to complain to a data protection authority. We
            process your information to provide the Service you request (contract), to keep it secure (legitimate
            interests), and to meet legal obligations.
          </p>
          <h3>8.2 California</h3>
          <p>
            California residents may request disclosure of the information we collect and its deletion. We do not
            &quot;sell&quot; or &quot;share&quot; personal information as those terms are defined under California law.
          </p>
        </section>

        <section>
          <h2>9. Data Transfers</h2>
          <p>
            Your information may be processed and stored in the United States, where privacy laws may differ from those
            where you live.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            If we change this policy, we will update the effective date above. If the changes are significant, we will let
            account holders know by email or in the Service.
          </p>
        </section>

        <LegalContact />
      </div>
    </ArticleLayout>
  );
}
