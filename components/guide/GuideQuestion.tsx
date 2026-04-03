'use client';

type GuideOption = {
  label: string;
  value: string;
};

export function GuideQuestion({
  label,
  options,
  selectedValue,
  onSelect,
}: {
  label: string;
  options: readonly GuideOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="animate-[tp-guide-fade_320ms_ease]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] tp-text-muted">
        {label}
      </p>

      <div className="mt-4 grid gap-3">
        {options.map((option) => {
          const selected = option.value === selectedValue;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`min-h-[52px] rounded-full border px-5 py-3 text-left text-sm transition ${
                selected
                  ? 'bg-[var(--tp-accent)] text-[var(--tp-cream)]'
                  : 'bg-transparent tp-text hover:bg-[var(--tp-accent-soft)]'
              }`}
              style={{
                borderColor: 'var(--tp-accent)',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
