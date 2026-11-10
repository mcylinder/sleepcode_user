'use client';

import { useEffect, useState } from 'react';
import { lastSevenNights } from '@/lib/listenNights';

export default function ListenHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [days, setDays] = useState(() => lastSevenNights());

  useEffect(() => {
    setDays(lastSevenNights());
  }, [refreshKey]);

  return (
    <div
      className="flex items-start justify-center gap-3.5"
      role="img"
      aria-label="Listening over the last 7 nights"
    >
      {days.map((day) => {
        const ringOnly = !day.listened;
        const todayStyle = day.isToday;
        return (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <span
              className="box-border h-2 w-2 rounded-full"
              style={
                day.listened
                  ? { background: 'var(--p-accent)' }
                  : {
                      background: 'transparent',
                      border: `1.5px solid ${todayStyle ? 'var(--p-today)' : '#5d706d'}`,
                    }
              }
              data-ring={ringOnly ? '1' : undefined}
            />
            <span
              className="text-[11px] leading-none"
              style={{
                color: todayStyle ? 'var(--p-today)' : 'var(--p-muted)',
                fontWeight: todayStyle ? 600 : 400,
              }}
            >
              {day.letter}
            </span>
          </div>
        );
      })}
    </div>
  );
}
