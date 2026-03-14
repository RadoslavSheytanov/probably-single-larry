import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './state/store';
import { validateStoredLicense, clearLicense } from './services/license';
import LicenseGate from './screens/LicenseGate';
import Home from './screens/Home';
import StealthInput from './screens/StealthInput';
import ResultPeek from './screens/ResultPeek';
import Settings from './screens/Settings';
import History from './screens/History';
import Instructions from './screens/Instructions';

type AuthState = 'checking' | 'active' | 'needs-auth';
const REVIEW_MODE_ENABLED = import.meta.env.VITE_REVIEW_MODE === 'true';

export default function App() {
  const screen = useStore((s) => s.screen);
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    if (REVIEW_MODE_ENABLED) {
      setAuthState('active');
      return;
    }

    validateStoredLicense().then((valid) => {
      setAuthState(valid ? 'active' : 'needs-auth');
    });
  }, []);

  function handleDeactivate() {
    clearLicense();
    setAuthState('needs-auth');
  }

  if (authState === 'checking') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <span className="w-4 h-4 rounded-full border border-white/20 border-t-white/40 animate-spin" />
      </div>
    );
  }

  if (authState === 'needs-auth') {
    return <LicenseGate onActivated={() => setAuthState('active')} />;
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <Home key="home" />}
      {screen === 'stealth' && <StealthInput key="stealth" />}
      {screen === 'result' && <ResultPeek key="result" />}
      {screen === 'settings' && <Settings key="settings" onDeactivate={handleDeactivate} />}
      {screen === 'history' && <History key="history" />}
      {screen === 'instructions' && <Instructions key="instructions" />}
    </AnimatePresence>
  );
}
