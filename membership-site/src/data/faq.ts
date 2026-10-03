import { FEATURED_FREE_SESSION, MEMBER_ONLY_COUNT, moreSessionsLabel } from '@/lib/catalog';
import { PRICES } from '@/lib/membership';

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const FREE_TITLE = FEATURED_FREE_SESSION?.title ?? 'One session';
const PRICE_LINE = `${PRICES.month.amount} ${PRICES.month.label} or ${PRICES.year.amount} ${PRICES.year.label}`;

const CANCEL: FaqItem = {
  q: 'Can I cancel?',
  a: 'Yes, at any time. Go to Account and choose Manage billing. You keep access until the end of the period you paid for, and you won\u2019t be charged again.',
};

const NOT_THERAPY: FaqItem = {
  q: 'Is this a replacement for therapy?',
  a: 'No. SleepCode is a tool for everyday habits of mind, not medical treatment. It isn\u2019t intended to diagnose or treat any condition. If you\u2019re struggling, please talk to someone qualified.',
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Using SleepCode',
    items: [
      {
        q: 'What does supraliminal mean?',
        a: 'Every word in a session is clearly audible. Nothing is hidden under music or played too quietly to hear. You know exactly what you are listening to.',
      },
      {
        q: 'How is that different from subliminal audio?',
        a: 'Subliminal tracks hide messages below hearing. We think you should be able to hear, check and choose every sentence, so ours are spoken plainly.',
      },
      {
        q: 'How often should I listen?',
        a: 'Daily works best, because repetition does the work. Choose how many repeats you want in the player, or set a session length and let it run.',
      },
      {
        q: 'Can I listen as I fall asleep?',
        a: 'Yes. Set a session length so it stops on its own, and use Night shade to turn the screen fully black.',
      },
      {
        q: 'Do I need to download an app?',
        a: 'No. SleepCode runs in your phone\u2019s web browser, and on a computer too.',
      },
      {
        q: 'Will the audio stop if my screen turns off?',
        a: 'SleepCode keeps your screen awake while a session plays so the audio isn\u2019t interrupted. Night shade blacks out the screen without stopping it.',
      },
    ],
  },
  {
    title: 'Membership',
    items: [
      {
        q: 'What is free?',
        a: `${FREE_TITLE} is free to keep with a free account, with no time limit. SleepCode+ adds ${moreSessionsLabel(MEMBER_ONLY_COUNT)} for ${PRICE_LINE}.`,
      },
      CANCEL,
      {
        q: 'Is my data private?',
        a: 'We keep only what we need to run your account. No ads, no third-party trackers, and we never see your card details; payments are handled by Stripe.',
      },
      NOT_THERAPY,
    ],
  },
];

export const PRICING_FAQ: FaqGroup[] = [
  {
    title: 'Membership',
    items: [
      CANCEL,
      {
        q: 'Is there a free trial?',
        a: `There\u2019s no trial, and you don\u2019t need one. ${FREE_TITLE} is free with an account signup.`,
      },
      {
        q: 'Can I switch between monthly and yearly?',
        a: 'Yes. Choose Manage billing in Account. Stripe adjusts the price for the time left on your current plan.',
      },
      {
        q: 'How do I pay?',
        a: 'All major credit and debit cards. Payments are processed by Stripe; we never see or store your card details.',
      },
    ],
  },
];
