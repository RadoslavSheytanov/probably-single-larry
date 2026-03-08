import { motion } from 'framer-motion';
import type { Phase } from '../utils/types';

interface Props {
  phase: Phase;
}

const PHASES: Phase[] = ['ANCHOR', 'DIFFERENCE', 'COMPUTED', 'RESOLVING'];

export default function PhaseIndicator({ phase }: Props) {
  const activeIndex = PHASES.indexOf(phase);

  return (
    <div className="flex items-center gap-3">
      {PHASES.map((p, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <motion.div
            key={p}
            className="rounded-full"
            style={{ width: 4, height: 4 }}
            animate={{
              opacity: isActive ? 0.25 : isPast ? 0.10 : 0.06,
              boxShadow: isActive
                ? '0 0 6px 2px rgba(255,255,255,0.15)'
                : 'none',
              scale: isActive ? 1.2 : 1,
              backgroundColor: '#ffffff',
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}
