import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';
import type { Reading } from '../utils/types';
import ScreenHeader from '../components/ScreenHeader';

function HistoryEntry({ reading }: { reading: Reading }) {
  const date = reading.resolvedDate;
  if (!date) return null;

  const { day, month, sign } = date;

  return (
    <div className="flex items-center py-4 border-b border-white/[4%]">
      <span className="text-3xl mr-4 leading-none">{sign.symbol}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-base font-light">
          {MONTH_NAMES[month - 1]} {day}
        </p>
        <p className="text-white/30 text-xs mt-0.5">
          {new Date(reading.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
      <p className="text-white/30 text-xs tracking-wide ml-3 text-right flex-shrink-0">
        {sign.name}
      </p>
    </div>
  );
}

export default function History() {
  const setScreen = useStore((s) => s.setScreen);
  const history = useStore((s) => s.history);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <ScreenHeader
        title="History"
        rightElement={
          <button
            className="text-white/30 text-xs tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); setScreen('home'); }}
            onClick={() => setScreen('home')}
          >
            Close
          </button>
        }
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">
        {history.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-white/[12%] text-sm tracking-widest uppercase">No readings yet</p>
          </motion.div>
        ) : (
          history.map((reading) => (
            <HistoryEntry key={reading.id} reading={reading} />
          ))
        )}
      </div>

      {/* Entry count */}
      {history.length > 0 && (
        <div className="px-6 pb-8 pt-2">
          <p className="text-white/[12%] text-xs tracking-widest uppercase text-center">
            {history.length} reading{history.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
