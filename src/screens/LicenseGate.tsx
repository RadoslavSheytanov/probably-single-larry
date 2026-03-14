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

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 15000)
    );
    try {
      const result = await Promise.race([activateLicense(email, key), timeoutPromise]);
      if (result.ok) {
        onActivated();
      } else {
        setError(result.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'timeout') {
        setError('Request timed out. Check your connection and try again.');
      } else {
        setError('Activation failed. Try again.');
      }
    } finally {
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
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_62%)] pointer-events-none" />

      <div className="flex flex-col items-center pt-safe-header px-6 pb-0">
        <p className="text-[11px] tracking-[8px] uppercase font-medium text-white/62">
          Singularis
        </p>
        <div className="mt-5 w-10 border-t border-white/[10%]" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">
        <div className="pt-10 pb-8">
          <h1 className="font-display-upright text-[36px] font-light tracking-[0.16em] uppercase text-white/82 text-center">
            Activate
          </h1>
          <p className="mt-6 text-white/34 text-[13px] leading-[1.85] font-light text-center">
            Enter the email and license key from your purchase confirmation.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); handleActivate(); }}>
          <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-5">
            <p className="text-white/42 text-[10px] tracking-[4px] uppercase mb-3">Email</p>
            <input
              type="email"
              aria-label="Email address"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-white/[3%] border border-white/[8%] rounded-2xl px-4 py-3.5 text-white/78 text-sm font-light placeholder-white/[14%] outline-none focus:border-white/18"
            />
          </div>

          <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-5">
            <p className="text-white/42 text-[10px] tracking-[4px] uppercase mb-3">License Key</p>
            <input
              type="text"
              aria-label="License key"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={handleKeyDown}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-white/[3%] border border-white/[8%] rounded-2xl px-4 py-3.5 text-white/78 text-sm font-mono placeholder-white/[14%] outline-none focus:border-white/18"
            />
          </div>

          <input
            type="submit"
            hidden
          />

          <AnimatePresence>
            {error && (
              <motion.p
                key="err"
                className="text-xs text-center px-4 leading-relaxed text-err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className={`w-full py-[18px] rounded-[24px] border border-white/[12%] bg-white/[6%] text-white/88 text-xs tracking-[5px] uppercase font-light${loading ? ' opacity-50 pointer-events-none' : ''}`}
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
            className="block text-center text-white/[30%] text-[11px] tracking-[4px] uppercase pt-3"
          >
            Purchase a license
          </a>
        </form>
      </div>
    </motion.div>
  );
}
