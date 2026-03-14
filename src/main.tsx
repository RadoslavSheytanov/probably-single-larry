import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const REVIEW_MODE_ENABLED = import.meta.env.VITE_REVIEW_MODE === 'true'

// ── Production hardening ──────────────────────────────────────────────────────
if (import.meta.env.PROD && !REVIEW_MODE_ENABLED) {
  // Domain lock — update ALLOWED_DOMAINS before deploying
  const ALLOWED_DOMAINS = ['singularis.app', 'www.singularis.app'];
  if (!ALLOWED_DOMAINS.includes(location.hostname)) {
    document.documentElement.style.background = '#000';
    document.body.innerHTML = '';
    throw new Error();
  }

  // Anti-debugging: measure time across debugger statement.
  // The statement is a no-op when DevTools is closed; it pauses (>100ms) when open.
  const antiDebug = () => {
    const t = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (performance.now() - t > 100) {
      document.documentElement.style.background = '#000';
      document.body.innerHTML = '';
    }
  };
  setInterval(antiDebug, 3000 + Math.random() * 2000);
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
