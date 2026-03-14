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
          className="font-ui-medium w-16 text-left text-[11px] uppercase tracking-[3px] text-white/34 transition-colors active:text-white/62"
          onTouchStart={(e) => { e.preventDefault(); onBack(); }}
          onClick={onBack}
        >
          ←
        </button>
      ) : (
        <div className="w-16" />
      )}

      <h2 className={titleClassName ?? 'font-display-upright text-[15px] tracking-[5px] uppercase text-white/74'}>
        {title}
      </h2>

      <div className="w-16 flex justify-end">
        {rightElement ?? null}
      </div>
      </div>
      <div className="mt-5 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
    </div>
  );
}
