import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './state/store';
import { captureURLToken, exchangeToken, logout } from './services/license';
import { useHeartbeat } from './hooks/useHeartbeat';
import LicenseGate from './screens/LicenseGate';
import Home from './screens/Home';
import StealthInput from './screens/StealthInput';
import ResultPeek from './screens/ResultPeek';
import Settings from './screens/Settings';
import History from './screens/History';
import PracticeMode from './screens/PracticeMode';

type SessionState = 'checking' | 'active' | 'needs-auth';

export default function App() {
  const screen = useStore((s) => s.screen);
  const [sessionState, setSessionState] = useState<SessionState>('checking');
  const [exchangeError, setExchangeError] = useState('');

  useEffect(() => {
    async function init() {
      const urlToken = captureURLToken();
      if (urlToken) {
        const result = await exchangeToken(urlToken);
        if (result.ok) {
          setSessionState('active');
          return;
        }
        setExchangeError(result.error);
      }
      setSessionState('needs-auth');
    }
    init();
  }, []);

  useHeartbeat({
    enabled: sessionState === 'active',
    onExpired: () => setSessionState('needs-auth'),
  });

  async function handleDeactivate() {
    await logout();
    setSessionState('needs-auth');
  }

  if (sessionState === 'checking') {
    return <div className="fixed inset-0 bg-black" />;
  }

  if (sessionState === 'needs-auth') {
    return (
      <LicenseGate
        onActivated={() => { setExchangeError(''); setSessionState('active'); }}
        initialError={exchangeError}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <Home key="home" />}
      {screen === 'stealth' && <StealthInput key="stealth" />}
      {screen === 'result' && <ResultPeek key="result" />}
      {screen === 'settings' && <Settings key="settings" onDeactivate={handleDeactivate} />}
      {screen === 'history' && <History key="history" />}
      {screen === 'practice' && <PracticeMode key="practice" />}
    </AnimatePresence>
  );
}
