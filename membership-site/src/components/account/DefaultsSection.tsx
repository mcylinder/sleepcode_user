'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MixIcon, PlayIcon, RepeatIcon, VoiceIcon } from '@/components/ui/icons';
import { pulseWidthLabel } from '@/lib/audio/pulseWidth';
import { backgroundMixLabel } from '@/lib/backgrounds';
import { FEATURED_FREE_SESSION, findVoice, loadLastPlayed, playerHref } from '@/lib/catalog';
import { DEFAULT_PREFS, REPEAT_LABELS, loadPlayerPrefs, type PlayerPrefs } from '@/lib/playerPrefs';
import { AccountSection } from './Section';

function backgroundSummary(prefs: PlayerPrefs): string {
  if (prefs.background.group === 'pulse') {
    return `Pulse (${pulseWidthLabel(prefs.background.width)})`;
  }
  const bg = backgroundMixLabel(prefs.background);
  return `${bg.name} · ${bg.group === 'nature' ? 'Nature' : 'Music'}`;
}

// A read-only summary. The player remembers your last choices; this shows what they are.
export default function DefaultsSection() {
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [playerLink, setPlayerLink] = useState<string | null>(
    FEATURED_FREE_SESSION ? playerHref(FEATURED_FREE_SESSION) : null,
  );

  useEffect(() => {
    setPrefs(loadPlayerPrefs());
    const last = loadLastPlayed();
    if (last) setPlayerLink(playerHref(last.session));
  }, []);

  const narrator = findVoice(prefs.voiceId)?.name ?? 'Not set';
  const rows: { label: string; icon: React.ReactNode; value: string }[] = [
    { label: 'Narrator', icon: <VoiceIcon size={18} />, value: narrator },
    {
      label: 'Background',
      icon: <MixIcon size={18} instruction={prefs.voiceMix} />,
      value: backgroundSummary(prefs),
    },
    { label: 'Repeat', icon: <RepeatIcon size={18} />, value: REPEAT_LABELS[prefs.repeat] },
  ];

  return (
    <AccountSection title="Listening settings">
      <p className="pb-3 text-[14px] leading-[1.55] text-ink-muted">
        Set these in the player. Your last choices are remembered.
      </p>
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 border-t border-hairline py-4">
            <dt className="flex items-center gap-[10px] text-[16px]">
              <span className="text-accent" aria-hidden="true">
                {row.icon}
              </span>
              {row.label}
            </dt>
            <dd className="text-[14px] text-ink-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
      {playerLink && (
        <Link
          href={playerLink}
          className="group mt-4 flex items-center gap-3 self-start rounded-full border border-hairline-strong py-[6px] pl-[6px] pr-5 text-[15px] font-medium transition-colors hover:border-accent"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-on-accent transition-transform group-hover:scale-105">
            <PlayIcon size={13} />
          </span>
          Open the player
        </Link>
      )}
    </AccountSection>
  );
}
