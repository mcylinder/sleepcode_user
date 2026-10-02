import ArticleLayout from '@/components/site/ArticleLayout';
import LegalContact from '@/components/LegalContact';

export default function CookiesPage() {
  return (
    <ArticleLayout eyebrow="Cookies" title="Cookie Policy" byline={`Effective ${new Date().toLocaleDateString()}`}>
          <div className="sc-prose">

            <p>
              This Cookie Policy explains how Sleep Coder LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies when you use the SleepCode mobile application and the sleepcoding.me website (the &quot;Service&quot;).
            </p>

            <section>
              <h2>
                1. What Are Cookies?
              </h2>
              <p>
                Cookies are small text files placed on your device to store information. Cookies are widely used to enable websites and applications to function properly, to enhance user experience, and to provide basic security.
              </p>
            </section>

            <section>
              <h2>
                2. How We Use Cookies
              </h2>
              <p>
                We use cookies strictly for the following purpose:
              </p>
              <p>
                <strong>Essential Session Management:</strong> Cookies are required to keep you logged in and maintain secure sessions while you use the Service.
              </p>
              <p>
                We do not use cookies for advertising, marketing, or tracking across third-party websites.
              </p>
            </section>

            <section>
              <h2>
                3. Analytics
              </h2>
              <p>
                We collect aggregated analytics regarding the usage of publicly available tracks. These analytics are performed through AWS server logs and do not use cookies or identify individual users.
              </p>
              <p>
                Private, user-generated instructions are not tracked.
              </p>
            </section>

            <section>
              <h2>
                4. Managing Cookies
              </h2>
              <p>
                Because our cookies are strictly necessary for login and security, they cannot be disabled through our Service. You may configure your browser to block or delete cookies, but doing so may prevent you from logging in or using key features.
              </p>
            </section>

            <section>
              <h2>
                5. Updates
              </h2>
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted on this page with a new &quot;Effective Date.&quot;
              </p>
            </section>

            <LegalContact sectionNumber={6} />
          </div>
    </ArticleLayout>
  );
}
