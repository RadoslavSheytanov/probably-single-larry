import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResolvedDate } from '../utils/types';
import { MONTH_NAMES, WATCH_PREVIEW_DURATION_MS } from '../utils/constants';

interface Props {
  date: ResolvedDate;
  visible: boolean;
  onDismiss: () => void;
}

export default function WatchPreview({ date, visible, onDismiss }: Props) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, WATCH_PREVIEW_DURATION_MS);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-4 right-4 flex flex-col gap-1 rounded-[22px] border border-white/[0.08] overflow-hidden"
          style={{
            width: 160,
            background: '#1c1c1e',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}
          initial={{ x: 180, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 180, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          onTouchEnd={(e) => { e.stopPropagation(); onDismiss(); }}
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        >
          <div className="px-4 pt-3 pb-3">
            <p className="text-[9px] tracking-[3px] uppercase text-white/25 mb-2">Watch Peek</p>
            <div className="text-3xl mb-1">{date.sign.symbol}</div>
            <p className="text-white/80 text-sm font-light tracking-wide">{date.sign.name}</p>
            <p className="text-white/50 text-xs font-light mt-0.5">
              {MONTH_NAMES[date.month - 1]} {date.day}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
