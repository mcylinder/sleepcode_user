import Link from 'next/link';
import ArticleLayout from '@/components/site/ArticleLayout';

const PRINCIPLES = [
  ['As little design as possible.', 'If a screen works without an element, the element doesn’t belong.'],
  ['Honest.', 'No fake progress, no manufactured urgency, no dark patterns.'],
  ['Unobtrusive.', 'The product’s job is to get out of the way of sleep, not to be admired.'],
  ['Long-lasting.', 'Choices that won’t look dated in two years over what looks striking today.'],
  ['Thorough down to the last detail.', 'Precision compounds, even when no one can say exactly why.'],
];

export default function AboutPage() {
  return (
    <ArticleLayout
      eyebrow="About"
      title="An instrument, not an appliance."
      dek="SleepCode is a method for falling asleep, built to get out of the way rather than be admired."
      byline="Sleep Coder LLC · South Portland, Maine"
    >
      <div className="sc-prose">
        <p>
          Most sleep apps reach for the same things: moons and stars, soft gradients, a soothing narrator telling you to
          relax. But &ldquo;relax&rdquo; is an instruction, and instructions get evaluated. Evaluation is the opposite of
          sleep.
        </p>
        <p>
          SleepCode works differently. Each session is a sequence of plain, first-person statements in one instructor&rsquo;s
          voice, layered over a slow pulse that holds just enough attention to quiet the counterargument. You set the blend
          once, choose how long it runs, and it stops itself.
        </p>

        <blockquote className="my-7 border-l-2 border-signal pl-4 text-[17px] font-medium leading-[1.5] wide:my-8 wide:max-w-[500px] wide:pl-5 wide:text-[19px]">
          The sentence has to sound like it&rsquo;s yours before your mind will believe it enough to release.
        </blockquote>

        <h2>How we build it</h2>
        <ul>
          {PRINCIPLES.map(([lead, rest]) => (
            <li key={lead}>
              <strong>{lead}</strong> {rest}
            </li>
          ))}
        </ul>

        <p className="text-fg-muted">
          Questions or ideas? <Link href="/contact">Get in touch</Link>.
        </p>
      </div>
    </ArticleLayout>
  );
}
