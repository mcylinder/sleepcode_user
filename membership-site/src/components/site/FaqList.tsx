'use client';

import { useId, useState } from 'react';
import type { FaqGroup } from '@/data/faq';

const EASE = 'cubic-bezier(.3,.7,.2,1)';

// One answer open at a time; the first is open to start.
export default function FaqList({ groups }: { groups: FaqGroup[] }) {
  const [open, setOpen] = useState<string>('0-0');
  const baseId = useId();

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group, gi) => (
        <div key={group.title} className="flex flex-col">
          {groups.length > 1 && <span className="sc-eyebrow sc-eyebrow--muted pb-[10px]">{group.title}</span>}
          {group.items.map((item, i) => {
            const key = `${gi}-${i}`;
            const isOpen = open === key;
            const panelId = `${baseId}-${key}`;
            return (
              <div key={item.q} className="border-t border-[rgba(44,38,32,0.16)]">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? '' : key)}
                  className="flex w-full items-center justify-between gap-4 py-[18px] text-left text-[17px] font-semibold leading-[1.35]"
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="relative h-4 w-4 flex-none text-accent"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: `transform .5s ${EASE}` }}
                  >
                    <span className="absolute inset-x-0 top-[7px] h-[1.75px] rounded-sm bg-current" />
                    <span
                      className="absolute inset-y-0 left-[7px] w-[1.75px] rounded-sm bg-current"
                      style={{ transform: isOpen ? 'scaleY(0)' : 'scaleY(1)', transition: `transform .5s ${EASE}` }}
                    />
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  className="grid"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', transition: `grid-template-rows .5s ${EASE}` }}
                >
                  <div className="min-h-0 overflow-hidden" inert={!isOpen}>
                    <p
                      className="max-w-[38em] pb-[22px] pr-9 text-[16px] leading-[1.65] text-ink-muted"
                      style={{ opacity: isOpen ? 1 : 0, transition: 'opacity .45s ease' }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
