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
    <li className="list-none border-b border-white/[5%] py-4 last:border-b-0">
      <div className="flex items-center">
      <span className="mr-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[7%] bg-white/[3%] text-[22px] leading-none text-white/50">
        {textSymbol(sign.symbol)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-ui-light text-base text-white/84">
          {MONTH_NAMES[month - 1]} {day}
        </p>
        <p className="font-ui-light mt-1 text-xs text-white/28">
          {new Date(reading.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
      <p className="font-ui-medium ml-3 flex-shrink-0 text-right text-xs uppercase tracking-[2px] text-white/32">
        {sign.name}
      </p>
      </div>
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
            className="font-ui-medium text-white/34 text-[11px] tracking-[3px] uppercase"
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
            className="flex h-full flex-col items-center justify-center pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-[30px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-8 py-8 text-center">
              <p className="font-ui-medium mb-3 text-[10px] uppercase tracking-[4px] text-white/[16%]">History</p>
              <p className="font-ui-medium text-sm uppercase tracking-[3px] text-white/[28%]">No readings yet</p>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5">
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
          <p className="font-ui-medium text-center text-[10px] uppercase tracking-[4px] text-white/[16%]">
            {history.length} reading{history.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
