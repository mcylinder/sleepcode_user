'use client';

import { useEffect, useState } from 'react';
import { lastSevenNights } from '@/lib/listenNights';

export default function ListenHistory({
  refreshKey = 0,
  tone = 'player',
}: {
  refreshKey?: number;
  tone?: 'player' | 'library';
}) {
  const [days, setDays] = useState(() => lastSevenNights());
  const library = tone === 'library';

  useEffect(() => {
    setDays(lastSevenNights());
  }, [refreshKey]);

  return (
    <div className={`flex flex-col gap-2 ${library ? 'items-start' : 'items-center'}`}>
      <span
        className={`text-[12px] font-medium tracking-wide ${
          library ? 'text-ink-muted' : 'text-p-muted'
        }`}
      >
        Sessions this week
      </span>
      <div
        className="flex items-start justify-center gap-3.5"
        role="img"
        aria-label="Sessions this week"
      >
        {days.map((day) => {
          const ringOnly = !day.listened;
          const todayStyle = day.isToday;
          const listenedFill = library ? 'var(--accent)' : 'var(--p-accent)';
          const emptyBorder = library
            ? todayStyle
              ? 'var(--accent-text)'
              : 'var(--ink-muted)'
            : todayStyle
              ? 'var(--p-today)'
              : 'var(--p-step-outline)';
          const labelColor = library
            ? todayStyle
              ? 'var(--accent-text)'
              : 'var(--ink-muted)'
            : todayStyle
              ? 'var(--p-today)'
              : 'var(--p-muted)';
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span
                className="box-border h-2 w-2 rounded-full"
                style={
                  day.listened
                    ? { background: listenedFill }
                    : {
                        background: 'transparent',
                        border: `1.5px solid ${emptyBorder}`,
                      }
                }
                data-ring={ringOnly ? '1' : undefined}
              />
              <span
                className="text-[11px] leading-none"
                style={{
                  color: labelColor,
                  fontWeight: todayStyle ? 600 : 400,
                }}
              >
                {day.letter}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
