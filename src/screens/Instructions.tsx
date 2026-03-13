import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import ScreenHeader from '../components/ScreenHeader';

function Section({ number, title, children }: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-white/[12%] text-[10px] tracking-[3px] uppercase tabular-nums">
          {number}
        </span>
        <h3 className="font-display text-[22px] text-white/70 leading-none">
          {title}
        </h3>
      </div>
      <div className="space-y-3 pl-6">
        {children}
      </div>
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/50 text-[14px] leading-[1.7] font-light">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="w-full h-px bg-white/[4%] my-3" />;
}

function GestureRow({ gesture, action }: { gesture: string; action: string }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-white/[4%] last:border-0">
      <span className="text-white/30 text-[12px] tracking-wide font-light w-32 shrink-0 pt-0.5">
        {gesture}
      </span>
      <span className="text-white/50 text-[13px] font-light leading-snug">
        {action}
      </span>
    </div>
  );
}

export default function Instructions() {
  const setScreen = useStore((s) => s.setScreen);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <ScreenHeader
        title="Guide"
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

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav pt-2">

        {/* Intro */}
        <p className="text-white/30 text-[13px] leading-[1.75] font-light mb-10">
          A spectator thinks of their date of birth. Without asking directly,
          you determine their birthday and star sign — the phone never leaves your pocket.
        </p>

        {/* ── 1. The System ── */}
        <Section number="01" title="The System">
          <Para>
            Every date can be expressed as two numbers: an Anchor (A) and a Difference (D).
          </Para>
          <div className="bg-white/[3%] rounded-xl px-5 py-4 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-white/20 text-[11px] tracking-[4px] uppercase w-6">A</span>
              <span className="text-white/60 text-[14px] font-light">birth month + birth day</span>
            </div>
            <div className="w-full h-px bg-white/[6%]" />
            <div className="flex items-center gap-3">
              <span className="text-white/20 text-[11px] tracking-[4px] uppercase w-6">D</span>
              <span className="text-white/60 text-[14px] font-light">larger − smaller (always positive)</span>
            </div>
          </div>
          <Para>
            For example: a birthday of <span className="text-white/70">June 14</span> gives
            A = 6 + 14 = <span className="text-white/70">20</span>, D = 14 − 6 = <span className="text-white/70">8</span>.
            From 20 and 8 the app reconstructs June 14 and the star sign Gemini.
          </Para>
        </Section>

        {/* ── 2. Getting the Numbers ── */}
        <Section number="02" title="Getting the Numbers">
          <Para>
            Guide the spectator through two simple mental calculations — framed as
            a "number game" before you attempt the revelation.
          </Para>
          <div className="space-y-0">
            {[
              ['Step 1', 'Ask them to take their birth month as a number (January = 1, December = 12).'],
              ['Step 2', 'Add their birth day to it. Ask them to tell you this total. This is A.'],
              ['Step 3', 'Now subtract the smaller of the two original numbers from the larger. Tell you that result too. This is D.'],
            ].map(([label, text]) => (
              <div key={label} className="flex gap-4 py-3 border-b border-white/[4%] last:border-0">
                <span className="text-white/20 text-[11px] tracking-[3px] uppercase shrink-0 pt-1 w-14">{label}</span>
                <p className="text-white/50 text-[13px] font-light leading-[1.65]">{text}</p>
              </div>
            ))}
          </div>
          <Para>
            They share two anonymous totals — their birthday is never spoken aloud.
          </Para>
        </Section>

        {/* ── 3. Performance Mode ── */}
        <Section number="03" title="Performance Mode">
          <Para>
            Tap <span className="text-white/70">Start Performance</span> on the home screen.
            The display goes black. Place the phone in your pocket, screen facing your leg.
          </Para>
          <Para>
            The four dots at the bottom of the screen indicate which phase you are in.
            Enter A first, then D.
          </Para>
          <Divider />
          <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-2">Entering a value</p>
          <GestureRow gesture="Tap bottom half" action="+1" />
          <GestureRow gesture="Tap top half" action="+10" />
          <GestureRow gesture="Double-tap" action="Undo last tap" />
          <GestureRow gesture="Three fingers" action="Reset current number to zero" />
          <GestureRow gesture="Long press" action="Confirm value and advance to next phase" />
          <Divider />
          <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-2 mt-1">Navigation</p>
          <GestureRow gesture="Swipe left" action="Go back to previous phase" />
          <GestureRow gesture="Swipe down" action="Exit performance mode" />
          <Divider />
          <Para>
            A distinct vibration pattern confirms each action: single pulse for a tap,
            double pulse for confirm, and a brief rumble for errors.
          </Para>
        </Section>

        {/* ── 4. Ambiguous Results ── */}
        <Section number="04" title="Ambiguous Results">
          <Para>
            Occasionally, A and D correspond to two possible birthdays — for example,
            April 7 and July 4 both give A = 11, D = 3. The screen shows both dates.
          </Para>
          <div className="bg-white/[3%] rounded-xl px-5 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-white/20 text-[10px] tracking-[3px] uppercase w-16 shrink-0">Top half</span>
              <span className="text-white/60 text-[13px] font-light">Earlier calendar date</span>
            </div>
            <div className="w-full h-px bg-white/[6%]" />
            <div className="flex items-center gap-3">
              <span className="text-white/20 text-[10px] tracking-[3px] uppercase w-16 shrink-0">Bottom half</span>
              <span className="text-white/60 text-[13px] font-light">Later calendar date</span>
            </div>
          </div>
          <Para>
            Ask a casual follow-up — "Is your birthday early or late in the year?" —
            then tap the correct half. The confirmed date is sent to your watch.
          </Para>
        </Section>

        {/* ── 5. First-Time Setup ── */}
        <Section number="05" title="First-Time Setup">
          <Para>
            Open <span className="text-white/70">Settings</span> and enter your ntfy topic.
            This is the channel your watch uses to receive results. Any string works —
            choose something non-obvious.
          </Para>
          <Para>
            Install the ntfy app on your watch or secondary phone and subscribe to the
            same topic. Test the connection by running a reading in
            <span className="text-white/70"> Practice Mode</span> first.
          </Para>
          <Para>
            Once configured, results arrive on your watch the instant you confirm D —
            before you even remove the phone from your pocket.
          </Para>
        </Section>

        {/* Footer */}
        <div className="mt-4 mb-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[4%]" />
          <p className="text-white/[10%] text-[9px] tracking-[4px] uppercase">Singularis</p>
          <div className="h-px flex-1 bg-white/[4%]" />
        </div>

      </div>
    </motion.div>
  );
}
