'use client';

import { useEffect } from 'react';

export default function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sc-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sc-sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="sc-sheet-handle" />
        {children}
      </div>
    </div>
  );
}
