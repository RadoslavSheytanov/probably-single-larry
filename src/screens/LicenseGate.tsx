import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { activateLicense } from '../services/license';

interface Props {
  onActivated: () => void;
}

export default function LicenseGate({ onActivated }: Props) {
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleActivate() {
    if (!email.trim() || !key.trim()) {
      setError('Enter your email and license key.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await activateLicense(email, key);
    if (result.ok) {
      onActivated();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !loading) handleActivate();
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Branding */}
      <div className="flex flex-col items-center pt-safe-header pb-2 px-8 mt-6">
        <p className="text-[10px] tracking-[6px] uppercase text-white/20 mb-2">Singularis</p>
        <h1
          className="text-4xl font-light tracking-widest uppercase text-white/70 mb-3"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Activate
        </h1>
        <p className="text-white/20 text-xs tracking-wide text-center leading-relaxed">
          Enter the email and license key from your purchase confirmation
        </p>
      </div>

      {/* Inputs */}
      <div className="flex-1 flex flex-col justify-center px-8 gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-4 text-white/70 text-sm placeholder-white/15 outline-none focus:border-white/20"
        />
        <input
          type="text"
          placeholder="XXXX-XXXX-XXXX-XXXX"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-4 text-white/70 text-sm font-mono placeholder-white/15 outline-none focus:border-white/20"
        />

        <AnimatePresence>
          {error && (
            <motion.p
              key="err"
              className="text-xs text-center px-4 leading-relaxed"
              style={{ color: 'rgba(255,90,90,0.75)' }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          className="w-full py-4 rounded-2xl border border-white/10 text-white/70 text-sm tracking-[4px] uppercase font-light"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          whileTap={loading ? {} : { scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); if (!loading) handleActivate(); }}
          onClick={() => { if (!loading) handleActivate(); }}
          disabled={loading}
        >
          {loading
            ? <span className="inline-block w-4 h-4 border border-white/30 border-t-white/70 rounded-full animate-spin" />
            : 'Activate'}
        </motion.button>

        <a
          href="https://gumroad.com/l/singularis"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-white/15 text-xs tracking-widest uppercase"
        >
          Purchase a license →
        </a>
      </div>

      <div className="pb-safe-nav pt-4 flex justify-center">
        <p className="text-white/10 text-[10px] tracking-widest uppercase">Singularis v2.0.0</p>
      </div>
    </motion.div>
  );
}
