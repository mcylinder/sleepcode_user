import ArticleLayout from '@/components/site/ArticleLayout';
import LegalContact from '@/components/LegalContact';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/site';

export default function TermsPage() {
  return (
    <ArticleLayout eyebrow="Terms" title="Terms & Conditions" byline={`Effective ${LEGAL_EFFECTIVE_DATE}`}>
      <div className="sc-prose">
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) are an agreement between you and Sleep Coder LLC, a limited
          liability company organized under the laws of the State of Maine, United States (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;). They govern your use of SleepCode at sleepcoding.me (the &quot;Service&quot;).
        </p>
        <p>By using the Service, you agree to these Terms. If you don&rsquo;t agree, please don&rsquo;t use the Service.</p>

        <section>
          <h2>1. The Service</h2>
          <p>
            SleepCode provides supraliminal audio sessions: clearly audible, first-person statements about a chosen goal,
            spoken over a steady pulse. Sessions are meant to be played as you fall asleep, but SleepCode is not a sleep
            aid. See section 6.
          </p>
        </section>

        <section>
          <h2>2. Accounts and Eligibility</h2>
          <p>
            2.1 You must be at least 13 years old to use the Service. If you are under 18, you confirm that a parent or
            guardian has agreed to these Terms.
          </p>
          <p>
            2.2 You can listen to free sessions without an account. An account lets you keep your settings and progress
            across devices.
          </p>
          <p>
            2.3 If you create an account, please give accurate information and keep your sign-in details secure. You are
            responsible for activity under your account.
          </p>
        </section>

        <section>
          <h2>3. Free and Paid Access</h2>
          <p>3.1 Some sessions are free. During the current beta, SleepCode offers free access only.</p>
          <p>
            3.2 If we offer paid plans, the price, billing period, and renewal terms will be shown before you buy.
            Payments are processed by Stripe. Paid plans renew automatically until canceled.
          </p>
          <p>
            3.3 You can cancel a paid plan at any time from your Account page. You keep access until the end of the period
            you paid for, and you won&rsquo;t be charged again. Except where required by law, payments are non-refundable.
          </p>
        </section>

        <section>
          <h2>4. Your License</h2>
          <p>
            4.1 We give you a limited, personal, non-exclusive, non-transferable, revocable license to use the Service for
            your own non-commercial use.
          </p>
          <p>4.2 You agree not to:</p>
          <ul>
            <li>(a) copy, record, redistribute, sell, or publicly perform session audio or scripts;</li>
            <li>(b) reverse-engineer or interfere with the Service, its servers, or its access controls;</li>
            <li>(c) use the Service unlawfully or in a way that could harm others.</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The Service, including its software, audio, scripts, text, designs, and trademarks, is owned by Sleep Coder LLC
            and protected by intellectual property laws. Using the Service doesn&rsquo;t give you ownership of any of it.
          </p>
        </section>

        <section>
          <h2>6. Health and Safety</h2>
          <p>
            6.1 SleepCode is a tool for everyday habits of mind and self-improvement. It is not a sleep aid, not a medical
            device, and not a substitute for professional care. It is not intended to diagnose, treat, cure, or prevent any
            medical, sleep, or psychological condition.
          </p>
          <p>6.2 We make no promise of specific results. Experiences vary.</p>
          <p>
            6.3 Never use the Service while driving, operating machinery, or in any situation that requires your
            attention. Keep the volume at a comfortable, low level.
          </p>
          <p>6.4 If you have a medical or mental health concern, please talk to a qualified professional.</p>
        </section>

        <section>
          <h2>7. Suspension and Termination</h2>
          <p>
            You can stop using the Service and delete your account at any time. We may suspend or close an account that
            violates these Terms, is used fraudulently or abusively, or exposes us or others to legal or security risk.
          </p>
        </section>

        <section>
          <h2>8. Disclaimers and Limitation of Liability</h2>
          <p>
            8.1 The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, to the
            extent permitted by law.
          </p>
          <p>
            8.2 To the maximum extent permitted by law, we are not liable for any indirect, incidental, consequential, or
            punitive damages. Our total liability for any claim will not exceed the amount you paid us in the twelve (12)
            months before the claim, or US $50 if you have not paid us anything.
          </p>
        </section>

        <section>
          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States and the State of Maine, without regard to
            conflict-of-law rules. Disputes will be resolved in the state or federal courts located in Maine.
          </p>
        </section>

        <section>
          <h2>10. Changes to These Terms</h2>
          <p>
            We may update these Terms. When we do, we will update the effective date above, and we will notify account
            holders of significant changes by email or in the Service. Continuing to use the Service after changes take
            effect means you accept them.
          </p>
        </section>

        <LegalContact />
      </div>
    </ArticleLayout>
  );
}
