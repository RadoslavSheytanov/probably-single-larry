import { AnimatePresence } from 'framer-motion';
import { useStore } from './state/store';
import Home from './screens/Home';
import StealthInput from './screens/StealthInput';
import ResultPeek from './screens/ResultPeek';

// Placeholder for screens not yet implemented
function ComingSoon({ label }: { label: string }) {
  const setScreen = useStore((s) => s.setScreen);
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-6">
      <p className="text-white/30 text-sm tracking-widest uppercase">{label}</p>
      <button
        className="text-white/20 text-xs tracking-widest uppercase border border-white/10 px-6 py-3 rounded-xl"
        onClick={() => setScreen('home')}
      >
        Back
      </button>
    </div>
  );
}

export default function App() {
  const screen = useStore((s) => s.screen);

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <Home key="home" />}
      {screen === 'stealth' && <StealthInput key="stealth" />}
      {screen === 'result' && <ResultPeek key="result" />}
      {screen === 'settings' && <ComingSoon key="settings" label="Settings — Phase 4" />}
      {screen === 'history' && <ComingSoon key="history" label="History — Phase 4" />}
      {screen === 'practice' && <ComingSoon key="practice" label="Practice Mode — Phase 4" />}
    </AnimatePresence>
  );
}
