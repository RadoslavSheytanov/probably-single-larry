import { motion } from 'framer-motion';
import type { Phase } from '../utils/types';

interface Props {
  phase: Phase;
}

const PHASES: Phase[] = ['ANCHOR', 'DIFFERENCE', 'COMPUTED', 'RESOLVING'];

export default function PhaseIndicator({ phase }: Props) {
  const activeIndex = PHASES.indexOf(phase);

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/[6%] bg-white/[2%] px-4 py-2">
      {PHASES.map((p, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <motion.div
            key={p}
            className="h-1.5 w-1.5 rounded-full"
            animate={{
              opacity: isActive ? 0.65 : isPast ? 0.24 : 0.08,
              boxShadow: isActive
                ? '0 0 8px 2px rgba(255,255,255,0.18)'
                : 'none',
              scale: isActive ? 1.25 : 1,
              backgroundColor: '#ffffff',
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}
