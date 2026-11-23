'use client';

import { SettingsIcon, StopwatchIcon } from './icons';

export default function PlayerCtas({
  onSettings,
  onLength,
  lengthLabel,
  lengthActive,
}: {
  onSettings: () => void;
  onLength: () => void;
  lengthLabel: string;
  lengthActive: boolean;
}) {
  return (
    <div className="flex items-start justify-center gap-[88px] pb-2 pt-1">
      <button type="button" onClick={onSettings} className="flex flex-col items-center gap-2 text-p-fg">
        <SettingsIcon size={28} className="stroke-[1.5]" />
        <span className="text-[12px] text-p-muted">Settings</span>
      </button>
      <button
        type="button"
        onClick={onLength}
        className={`flex flex-col items-center gap-2 ${lengthActive ? 'text-p-accent' : 'text-p-fg'}`}
      >
        <StopwatchIcon size={28} className="stroke-[1.5]" />
        <span
          className={`text-[12px] ${
            lengthActive ? 'font-mono text-[13px] font-medium tabular-nums text-p-accent' : 'text-p-muted'
          }`}
        >
          {lengthLabel}
        </span>
      </button>
    </div>
  );
}
