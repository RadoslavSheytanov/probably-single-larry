import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';
import type { Reading } from '../utils/types';
import ScreenHeader from '../components/ScreenHeader';

function textSymbol(symbol: string): string {
  return `${symbol}\uFE0E`;
}

function HistoryEntry({ reading }: { reading: Reading }) {
  const date = reading.resolvedDate;
  if (!date) return null;

  const { day, month, sign } = date;

  return (
    <li className="flex items-center py-4 border-b border-white/[5%] list-none last:border-b-0">
      <span className="text-[30px] mr-4 leading-none text-white/42">{textSymbol(sign.symbol)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white/84 text-base font-light">
          {MONTH_NAMES[month - 1]} {day}
        </p>
        <p className="text-white/32 text-xs mt-1">
          {new Date(reading.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
      <p className="text-white/36 text-xs tracking-[2px] uppercase ml-3 text-right flex-shrink-0">
        {sign.name}
      </p>
    </li>
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
            className="text-white/34 text-[11px] tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); setScreen('home'); }}
            onClick={() => setScreen('home')}
          >
            Close
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">
        {history.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-white/[16%] text-[10px] tracking-[4px] uppercase mb-3">History</p>
            <p className="text-white/[28%] text-sm tracking-[3px] uppercase">No readings yet</p>
          </motion.div>
        ) : (
          <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5">
            <ul className="list-none p-0 m-0">
              {history.map((reading) => (
                <HistoryEntry key={reading.id} reading={reading} />
              ))}
            </ul>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="px-6 pb-8 pt-3">
          <p className="text-white/[16%] text-[10px] tracking-[4px] uppercase text-center">
            {history.length} reading{history.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
