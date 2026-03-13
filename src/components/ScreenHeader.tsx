import type { ReactNode } from 'react';

interface Props {
  title: string;
  rightElement?: ReactNode;
  onBack?: () => void;
  titleClassName?: string;
}

/**
 * ScreenHeader — shared header for modal/overlay screens.
 * Used by Settings, History, Instructions and similar overlays.
 *
 * Layout: three-column flex row (left spacer | centered title | right element)
 * so the title stays visually centred regardless of whether onBack is shown.
 */
export default function ScreenHeader({ title, rightElement, onBack, titleClassName }: Props) {
  return (
    <div className="px-6 pt-safe-header pb-5">
      <div className="flex items-center justify-between">
      {onBack ? (
        <button
          className="text-white/34 text-[11px] tracking-[3px] uppercase w-16 text-left"
          onTouchStart={(e) => { e.preventDefault(); onBack(); }}
          onClick={onBack}
        >
          ←
        </button>
      ) : (
        <div className="w-16" />
      )}

      <h2 className={titleClassName ?? 'font-display-upright uppercase tracking-[6px] text-sm text-white/74'}>
        {title}
      </h2>

      <div className="w-16 flex justify-end">
        {rightElement ?? null}
      </div>
      </div>
      <div className="mt-5 h-px bg-white/[6%]" />
    </div>
  );
}
