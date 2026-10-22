import ArticleLayout from '@/components/site/ArticleLayout';
import LegalContact from '@/components/LegalContact';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/site';

export default function CookiesPage() {
  return (
    <ArticleLayout eyebrow="Cookies" title="Cookie Policy" byline={`Effective ${LEGAL_EFFECTIVE_DATE}`}>
      <div className="sc-prose">
        <p>
          This Cookie Policy explains how Sleep Coder LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and
          similar browser storage on sleepcoding.me (the &quot;Service&quot;).
        </p>
        <p>
          SleepCode uses only what it needs to work. No advertising cookies, no analytics, and no tracking across other
          websites.
        </p>

        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files a website stores in your browser. Local storage is a similar browser feature that
            keeps small amounts of data on your device.
          </p>
        </section>

        <section>
          <h2>2. What We Use</h2>
          <h3>2.1 Sign-in</h3>
          <p>
            If you create an account, our authentication provider (Google Firebase) stores what&rsquo;s needed to keep you
            signed in securely.
          </p>
          <h3>2.2 Player and site preferences</h3>
          <ul>
            <li>Your player settings and the last session you played (local storage).</li>
            <li>Whether you&rsquo;ve seen the player&rsquo;s first-time tips (cookie, up to one year).</li>
            <li>Whether you dismissed the create-account suggestion (cookie, seven days).</li>
            <li>Whether you&rsquo;ve acknowledged this cookie notice (local storage).</li>
          </ul>
          <p>These stay on your device and are used only to make the Service work the way you left it.</p>
        </section>

        <section>
          <h2>3. Managing Cookies</h2>
          <p>
            You can block or delete cookies and local storage in your browser settings. If you do, you may be signed out
            and the player will return to its default settings.
          </p>
        </section>

        <section>
          <h2>4. Updates</h2>
          <p>If we change how we use cookies, we will update this page and its effective date.</p>
        </section>

        <LegalContact sectionNumber={5} />
      </div>
    </ArticleLayout>
  );
}
