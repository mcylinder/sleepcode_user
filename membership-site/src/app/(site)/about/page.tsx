import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleLayout from '@/components/site/ArticleLayout';

export const metadata: Metadata = { title: 'About \u2014 SleepCode' };

const PRINCIPLES = [
  ['As little design as possible.', 'If a screen works without an element, the element doesn\u2019t belong.'],
  ['Honest.', 'No fake progress, no manufactured urgency, no dark patterns.'],
  ['Unobtrusive.', 'The product\u2019s job is to get out of the way, not to be admired.'],
  ['Long-lasting.', 'Choices that won\u2019t look dated in two years over what looks striking today.'],
  ['Thorough down to the last detail.', 'Precision compounds, even when no one can say exactly why.'],
];

export default function AboutPage() {
  return (
    <ArticleLayout
      eyebrow="About"
      title="An instrument, not an appliance."
      dek="SleepCode is supraliminal audio for specific goals, built to get out of the way rather than be admired."
      byline="Sleep Coder LLC \u00b7 South Portland, Maine"
    >
      <div className="sc-prose">
        <p>
          Most audio for the mind reaches for the same things: soft gradients, a soothing narrator telling you to relax,
          or messages hidden where you can&rsquo;t hear them. But &ldquo;relax&rdquo; is an instruction, and instructions
          get evaluated. Hidden messages ask for trust you can&rsquo;t check.
        </p>
        <p>
          SleepCode works differently. Each session is a sequence of plain, first-person statements in one
          instructor&rsquo;s voice, layered over a slow pulse. Every word is audible. You set the blend, choose how many
          repeats or how long it runs, and listen.
        </p>

        <p className="sc-pullquote">
          The sentence has to sound like it&rsquo;s yours before your mind will believe it enough to release.
        </p>

        <h2>How we build it</h2>
        <ul>
          {PRINCIPLES.map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
        </ul>

        <p>
          Questions or ideas? <Link href="/contact">Get in touch</Link>.
        </p>
      </div>
    </ArticleLayout>
  );
}
