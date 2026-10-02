import BreathingRings from '@/components/site/BreathingRings';
import StartSessionCta from '@/components/site/StartSessionCta';
import { LockIcon } from '@/components/ui/icons';

const STEPS = [
  {
    title: 'One instructor voice',
    desc: 'First-person statements, not affirmations spoken at you. Your mind rehearses them as its own.',
  },
  {
    title: 'A pulse underneath',
    desc: 'A slow tone at sleep tempo occupies just enough attention to quiet the counterargument.',
  },
  {
    title: 'You blend it, then drift',
    desc: 'Set the balance once. The session runs its length and stops itself — no phone to silence.',
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto flex w-full max-w-[1060px] flex-col items-center px-[30px] pt-10 text-center wide:flex-row wide:gap-[60px] wide:px-[60px] wide:pt-[70px] wide:text-left">
        <div className="max-w-[300px] wide:max-w-[430px] wide:flex-1">
          <h1 className="text-[27px] font-semibold leading-[1.25] tracking-[-0.01em] wide:text-[40px] wide:leading-[1.2]">
            Rewire how<br />you fall asleep.
          </h1>
          <p className="mt-[14px] text-[14px] leading-[1.55] text-fg-muted wide:mt-[18px] wide:text-[15px] wide:leading-[1.6]">
            One voice, speaking in first person, layered over a slow pulse tuned to hold just enough attention. Not a
            soundscape. Not a story. A method.
          </p>
          <div className="mt-[34px] flex flex-col items-center wide:mt-[30px] wide:flex-row wide:gap-5">
            <StartSessionCta />
            <span className="mt-[14px] text-[12px] text-fg-faint wide:mt-0">Free account. No card needed.</span>
          </div>
        </div>
        <div className="mt-[34px] flex-shrink-0 wide:mt-0">
          <BreathingRings />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1060px] px-[30px] pt-14 wide:px-[60px] wide:pt-[84px]">
        <div className="sc-eyebrow mb-5">How It Works</div>
        <ol className="flex flex-col wide:grid wide:grid-cols-3 wide:gap-10">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 border-b border-line py-[22px] first:pt-0 last:border-b-0 wide:flex-col wide:gap-0 wide:border-b-0 wide:border-t wide:pb-0 wide:pt-5 wide:first:pt-5"
            >
              <span className="flex-shrink-0 font-mono text-[12px] text-fg-faint">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="text-[15px] font-semibold wide:mt-[10px] wide:text-[16px]">{step.title}</div>
                <p className="mt-1 text-[13px] leading-[1.5] text-fg-muted wide:mt-[6px] wide:leading-[1.55]">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-[1060px] px-[30px] pt-11 wide:px-[60px] wide:pt-[60px]">
        <div className="sc-eyebrow mb-[14px]">Free to Start</div>
        <div className="flex items-start gap-3 wide:max-w-[560px]">
          <LockIcon size={14} className="mt-[2px]" />
          <p className="text-[13px] leading-[1.6] text-fg-muted">
            A handful of sessions are free, permanently. SleepCode+ unlocks the full catalogue as it grows — no ads, no
            gimmicks, cancel any time.
          </p>
        </div>
      </section>
    </>
  );
}
