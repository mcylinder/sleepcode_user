import { SEP, sessionSubtitle, type Session } from '@/lib/catalog';

// "Fresh Start · Mindset": the title leads; the collection (or "Part 1 of 4") follows in the
// same size but quieter, so the eye lands on the session's name first.
export default function SessionName({ session, tone = 'site' }: { session: Session; tone?: 'site' | 'player' }) {
  return (
    <>
      {session.title}
      <span className={`font-normal ${tone === 'player' ? 'text-p-muted' : 'text-ink-muted'}`}>
        {SEP}
        {sessionSubtitle(session)}
      </span>
    </>
  );
}
