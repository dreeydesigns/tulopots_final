'use client';

export function GuideTimer({
  secondsLeft,
  duration,
  paused = false,
}: {
  secondsLeft: number;
  duration: number;
  paused?: boolean;
}) {
  const progress = Math.max(0, Math.min(100, (secondsLeft / duration) * 100));

  return (
    <div className="mt-6">
      <p className="text-[11px] uppercase tracking-[0.14em] tp-text-muted">
        {paused ? 'Take your time. Close when you are ready.' : `Continue on your own in ${secondsLeft}s`}
      </p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--tp-border)]/60">
        <div
          className="h-full rounded-full bg-[var(--tp-accent)] transition-[width] duration-300 ease-linear"
          style={{ width: `${paused ? 100 : progress}%`, opacity: paused ? 0.35 : 1 }}
        />
      </div>
    </div>
  );
}
