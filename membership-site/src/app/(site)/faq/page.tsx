import Link from 'next/link';
import ArticleLayout from '@/components/site/ArticleLayout';
import { PRICES } from '@/lib/membership';

const FAQS = [
  {
    question: 'What is SleepCode?',
    answer:
      'A method for falling asleep. An instructor’s voice speaks plain, first-person statements over a slow pulse. You set the balance between the two, choose how long the session runs, and it stops on its own.',
  },
  {
    question: 'How do I start?',
    answer:
      'Create a free account, pick a session from Home, and press play. Use headphones or a speaker by the bed, set the session length, and put the phone down.',
  },
  {
    question: 'What’s free, and what does SleepCode+ include?',
    answer: `A handful of sessions are free, permanently, with a free account. SleepCode+ unlocks every session, including new ones as they’re added, for ${PRICES.month.amount} ${PRICES.month.label} or ${PRICES.year.amount} ${PRICES.year.label}.`,
  },
  {
    question: 'Do I need to download an app?',
    answer: 'No. SleepCode runs in your phone’s web browser. It works on a computer too, but it’s designed for the phone on your nightstand.',
  },
  {
    question: 'Will the audio stop if my screen turns off?',
    answer:
      'SleepCode keeps your screen awake while a session plays so the audio isn’t interrupted. Turn on Night Shade to black out the screen.',
  },
  {
    question: 'Can I cancel any time?',
    answer:
      'Yes. Go to Account and choose Manage billing. You keep access until the end of the period you’ve paid for, and you won’t be charged again.',
  },
  {
    question: 'Is my data private?',
    answer:
      'We keep only what we need to run your account. No ads, no third-party trackers, and we never see your card details; payments are handled by Stripe.',
  },
  {
    question: 'Is SleepCode a medical treatment?',
    answer:
      'No. SleepCode is for relaxation and self-improvement support. It isn’t intended to diagnose or treat any condition. If you have persistent sleep problems, talk to a healthcare provider.',
  },
];

export default function FAQPage() {
  return (
    <ArticleLayout eyebrow="FAQ" title="Questions, answered plainly." dek="How SleepCode works, what it costs, and what it isn’t.">
      <dl>
        {FAQS.map((faq, i) => (
          <div key={faq.question} className={`sc-row ${i === FAQS.length - 1 ? 'sc-row--last' : ''}`}>
            <dt className="text-[15px] font-semibold">{faq.question}</dt>
            <dd className="mt-[6px] text-[14px] leading-[1.6] text-fg-muted wide:max-w-[560px]">{faq.answer}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-[13px] text-fg-muted">
        Still have a question? <Link href="/contact" className="sc-link">Contact us</Link>.
      </p>
    </ArticleLayout>
  );
}
