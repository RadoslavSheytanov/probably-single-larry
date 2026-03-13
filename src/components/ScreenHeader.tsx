import type { ReactNode } from 'react';

interface Props {
  title: string;
  rightElement?: ReactNode;
  onBack?: () => void;
  titleClassName?: string;
}

/**
 * ScreenHeader — shared header for modal/overlay screens.
 * Used by Settings, History, PracticeMode.
 *
 * Layout: three-column flex row (left spacer | centered title | right element)
 * so the title stays visually centred regardless of whether onBack is shown.
 */
export default function ScreenHeader({ title, rightElement, onBack, titleClassName }: Props) {
  return (
    <div className="flex items-center justify-between px-6 pt-safe-header pb-4">
      {onBack ? (
        <button
          className="text-white/30 text-xs tracking-[3px] uppercase w-12 text-left"
          onTouchStart={(e) => { e.preventDefault(); onBack(); }}
          onClick={onBack}
        >
          ←
        </button>
      ) : (
        <div className="w-12" />
      )}

      <h2 className={titleClassName ?? 'font-display-upright uppercase tracking-[6px] text-sm text-white/70'}>
        {title}
      </h2>

      <div className="w-12 flex justify-end">
        {rightElement ?? null}
      </div>
    </div>
  );
}
