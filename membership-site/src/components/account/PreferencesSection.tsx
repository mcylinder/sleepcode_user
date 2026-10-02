'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from '@/components/ui/icons';
import { DEFAULT_PREFS, formatDuration, loadPlayerPrefs, type PlayerPrefs } from '@/lib/playerPrefs';
import { AccountSection } from './Section';

// Blend, repeat, and session length reflect what the player last saved on this device.
// Notifications and Download Quality are placeholders until those settings exist.
export default function PreferencesSection() {
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(loadPlayerPrefs());
  }, []);

  const rows = [
    { label: 'Voice & Pulse Blend', value: `${100 - prefs.blend} / ${prefs.blend}` },
    { label: 'Repeat Each Instruction', value: `${prefs.repeat}\u00d7` },
    { label: 'Session Length', value: prefs.timerMinutes ? formatDuration(prefs.timerMinutes) : 'No timer' },
    { label: 'Notifications', value: 'On' },
    { label: 'Download Quality', value: 'Wi-Fi Only' },
  ];

  return (
    <AccountSection title="Preferences">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center justify-between py-4 wide:py-[15px] ${i < rows.length - 1 ? 'border-b border-line' : ''}`}
        >
          <span className="text-[15px] font-medium wide:text-[14px]">{row.label}</span>
          <span className="flex items-center gap-[6px]">
            <span className="text-[13px] text-fg-muted">{row.value}</span>
            <ChevronRight />
          </span>
        </div>
      ))}
    </AccountSection>
  );
}
