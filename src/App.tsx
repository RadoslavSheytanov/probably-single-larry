import { AnimatePresence } from 'framer-motion';
import { useStore } from './state/store';
import Home from './screens/Home';
import StealthInput from './screens/StealthInput';
import ResultPeek from './screens/ResultPeek';
import Settings from './screens/Settings';
import History from './screens/History';
import PracticeMode from './screens/PracticeMode';

export default function App() {
  const screen = useStore((s) => s.screen);

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <Home key="home" />}
      {screen === 'stealth' && <StealthInput key="stealth" />}
      {screen === 'result' && <ResultPeek key="result" />}
      {screen === 'settings' && <Settings key="settings" />}
      {screen === 'history' && <History key="history" />}
      {screen === 'practice' && <PracticeMode key="practice" />}
    </AnimatePresence>
  );
}
