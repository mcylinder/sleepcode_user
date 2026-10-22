import { FEATURED_FREE_SESSION, sessionLabel } from '@/lib/catalog';

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const FREE_LABEL = FEATURED_FREE_SESSION ? sessionLabel(FEATURED_FREE_SESSION) : 'Open Door · Optimism';

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
        a: 'Every word in a session is clearly audible. Nothing is hidden under music or played too quietly to hear. You know exactly what you are listening to. It\u2019s the opposite of subliminal.',
      },
      {
        q: 'How is that different from subliminal audio?',
        a: 'Subliminal tracks hide messages below hearing. We think you should be able to hear, read and check every sentence, so ours are spoken plainly.',
      },
      {
        q: 'What is the pulse?',
        a: 'The pulse is a soft 111 Hz tone. Its rhythm is matched to the cadence of the statements, so each one arrives on a steady beat. The repetition is designed to be gently hypnotic, giving your attention somewhere to rest so the words can be absorbed rather than analyzed.',
      },
      {
        q: 'Is SleepCode a sleep aid?',
        a: 'No. It isn\u2019t designed to help you fall asleep, and it doesn\u2019t treat sleep problems. Bedtime is simply when most people listen: as you drift off, your mind is quiet enough to hear the statements with fewer distractions.',
      },
      {
        q: 'Does it work?',
        a: `Attitudes are habits, and habits can change with gentle, steady repetition. SleepCode gives you the same clear statements night after night, so a new way of thinking has room to settle in. Everyone\u2019s experience is different. ${FREE_LABEL} is free, so give it a few weeks and see how it feels for you.`,
      },
      {
        q: 'Whose voice is it?',
        a: 'The voice is made with a text-to-speech system, chosen and directed for clarity and calm, so the delivery stays even across hours of listening. Every statement is written, edited and listened to by a person before it\u2019s added to a session.',
      },
      {
        q: 'How often should I listen?',
        a: 'Daily works best, because repetition does the work. In the player you can hear each statement more than once, or set a session length and let it run.',
      },
      {
        q: 'Can I listen as I fall asleep?',
        a: 'Yes. Set a session length so it stops on its own, and use Night shade to turn the screen fully black. Falling asleep is simply a good time to listen; the session itself is about your goal.',
      },
      {
        q: 'Can I use headphones?',
        a: 'Yes, or a speaker. Keep the volume low. If you wear headphones in bed, choose a comfortable pair made for sleeping.',
      },
      {
        q: 'How long is a session?',
        a: 'As long as you like, up to 10 hours. Set a length in the player and it stops on its own.',
      },
      {
        q: 'Can I read what\u2019s said?',
        a: 'Yes. Every session lists every statement it speaks. Find the link in the library or the player. Nothing is spoken that isn\u2019t written there.',
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
    title: 'Account',
    items: [
      {
        q: 'What is free?',
        a: `${FREE_LABEL} is free, with no account needed. Create a free account to keep your settings and progress wherever you listen. More sessions are coming soon.`,
      },
      {
        q: 'Is my data private?',
        a: 'We keep only what we need to run your account. No ads and no third-party trackers.',
      },
      NOT_THERAPY,
    ],
  },
];

// Kept for the pricing page (hidden in beta nav; code retained for later).
export const PRICING_FAQ: FaqGroup[] = [
  {
    title: 'Membership',
    items: [
      {
        q: 'Can I cancel?',
        a: 'Yes, at any time. Go to Account and choose Manage billing. You keep access until the end of the period you paid for, and you won\u2019t be charged again.',
      },
      {
        q: 'Is there a free trial?',
        a: `There\u2019s no trial, and you don\u2019t need one. ${FREE_LABEL} is free with an account signup.`,
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
