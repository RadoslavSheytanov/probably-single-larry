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
    <p className="text-white/50 text-[14px] leading-[1.75] font-light">
      {children}
    </p>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-white/[4%] last:border-0">
      <span className="text-white/20 text-[11px] tracking-[3px] uppercase shrink-0 pt-[3px] w-6 tabular-nums">
        {n}.
      </span>
      <p className="text-white/50 text-[14px] font-light leading-[1.7]">{children}</p>
    </div>
  );
}

function GestureRow({ gesture, action }: { gesture: string; action: string }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-white/[4%] last:border-0">
      <span className="text-white/30 text-[12px] font-light w-32 shrink-0 pt-0.5 leading-snug">
        {gesture}
      </span>
      <span className="text-white/50 text-[13px] font-light leading-snug">
        {action}
      </span>
    </div>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/[3%] rounded-xl px-5 py-4">
      {children}
    </div>
  );
}

function AppLink({ store, label, url }: { store: string; label: string; url: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[4%] last:border-0">
      <div>
        <p className="text-white/60 text-[13px] font-light">{store}</p>
        <p className="text-white/25 text-[11px] font-light mt-0.5">{label}</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/30 text-[11px] tracking-[2px] uppercase border border-white/[8%] rounded-lg px-3 py-1.5 active:bg-white/[4%]"
        onClick={(e) => e.stopPropagation()}
      >
        Open
      </a>
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
        title="Quick-Start Guide"
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
        <p className="text-white/30 text-[13px] leading-[1.8] font-light mb-10">
          This guide covers everything you need to perform your first reading.
          For the full performance script, presentation tips, and advanced handling,
          refer to the PDF and video materials sent to your email after purchase.
        </p>

        {/* ── 1. Setting Up Notifications ── */}
        <Section number="01" title="Setting Up Notifications">
          <Para>
            This app sends your results silently to a second device, such as a
            smartwatch or a phone in your breast pocket. It does this through a
            free notification service called ntfy.
          </Para>
          <Para>
            First, download the ntfy app on the device that will receive your results.
          </Para>
          <NoteBox>
            <AppLink
              store="iPhone and Apple Watch"
              label="Download on the App Store"
              url="https://apps.apple.com/us/app/ntfy/id1625396347"
            />
            <AppLink
              store="Android and Wear OS"
              label="Download on Google Play"
              url="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
            />
          </NoteBox>
          <Para>
            Once installed, open ntfy and subscribe to any topic name you choose.
            A topic is just a short text label, for example: your name, a word,
            anything you will remember. Avoid obvious names like "magic" or "show".
          </Para>
          <Para>
            Then open Settings in this app and enter that same topic name in the
            ntfy Topic field. That is all. Every result will now appear on your
            watch the moment you finish entering the numbers.
          </Para>
          <Para>
            Run a test in Practice Mode before your first performance to confirm
            the connection is working.
          </Para>
        </Section>

        {/* ── 2. The Presentation ── */}
        <Section number="02" title="The Presentation">
          <Para>
            You frame this as a quick life path number calculation. Tell the spectator
            you only need two numbers from them, and that their birthday will never
            be spoken out loud.
          </Para>
          <Para>
            Ask them to follow these three steps in their head.
          </Para>
          <Step n={1}>
            Take your birth month as a number. January is 1, February is 2,
            and so on up to December, which is 12.
          </Step>
          <Step n={2}>
            Add your birth day to that number. For example, if you were born on
            the 14th, add 14 to your month number. Tell me the total out loud.
            Write it down if you like. This is your first number.
          </Step>
          <Step n={3}>
            Now take those two original numbers again: your month and your day.
            Subtract the smaller one from the larger one. Tell me that result too.
            This is your second number.
          </Step>
          <Para>
            Those two totals are all you need. The app reconstructs the original
            birthday and star sign from them.
          </Para>
          <NoteBox>
            <p className="text-white/40 text-[12px] font-light leading-[1.7]">
              Example: born on June 14. Month = 6, day = 14.
              First number: 6 + 14 = <span className="text-white/70">20</span>.
              Second number: 14 minus 6 = <span className="text-white/70">8</span>.
              The app recovers June 14 and the star sign Gemini from 20 and 8.
            </p>
          </NoteBox>
        </Section>

        {/* ── 3. Entering the Numbers ── */}
        <Section number="03" title="Entering the Numbers">
          <Para>
            Tap Start Performance on the home screen. The display goes black.
            Put the phone in your pocket with the screen facing your leg.
          </Para>
          <Para>
            The four small dots at the bottom of the screen show which phase
            you are in. You enter the first number (from Step 2 above) first,
            then the second number (from Step 3 above).
          </Para>
          <Para>
            Use your thumb to tap while the phone is in your pocket.
          </Para>
          <div className="w-full h-px bg-white/[4%] my-1" />
          <p className="text-white/20 text-[10px] tracking-[4px] uppercase pt-1 pb-2">Adding to the number</p>
          <GestureRow gesture="Tap bottom half" action="Add 1 to the current number" />
          <GestureRow gesture="Tap top half" action="Add 10 to the current number" />
          <div className="w-full h-px bg-white/[4%] my-1" />
          <p className="text-white/20 text-[10px] tracking-[4px] uppercase pt-1 pb-2">Correcting mistakes</p>
          <GestureRow gesture="Double tap" action="Undo the last tap" />
          <GestureRow gesture="Three fingers" action="Reset the current number back to zero" />
          <GestureRow gesture="Swipe left" action="Go back to re-enter the previous number" />
          <div className="w-full h-px bg-white/[4%] my-1" />
          <p className="text-white/20 text-[10px] tracking-[4px] uppercase pt-1 pb-2">Confirming and exiting</p>
          <GestureRow gesture="Long press" action="Confirm the current number and move to the next phase" />
          <GestureRow gesture="Swipe down" action="Exit performance mode and return to the home screen" />
          <div className="w-full h-px bg-white/[4%] my-1" />
          <Para>
            The phone vibrates with a distinct pattern after each action so you
            always know what happened without looking at the screen.
          </Para>
        </Section>

        {/* ── 4. When Two Dates Appear ── */}
        <Section number="04" title="When Two Dates Appear">
          <Para>
            Some birthdays share the same two numbers as another birthday.
            When this happens, the app cannot decide on its own. The screen
            shows both possible dates and vibrates twice.
          </Para>
          <Para>
            The earlier calendar date is always on the top half of the screen.
            The later calendar date is always on the bottom half.
          </Para>
          <Para>
            To find out which is correct, ask a simple casual question that sounds
            natural. Something like: "Is your birthday in the first half of the year,
            or the second half?" Once you know, tap the corresponding half of the
            screen. The confirmed date is then sent to your watch.
          </Para>
          <NoteBox>
            <p className="text-white/40 text-[12px] font-light leading-[1.7]">
              The Practice Mode drill shows an "Ambiguous" label whenever a
              randomly generated date would produce this situation. Use it to
              get comfortable with the follow-up question before performing live.
            </p>
          </NoteBox>
        </Section>

        {/* ── 5. Learn More ── */}
        <Section number="05" title="Learn More">
          <Para>
            This quick-start guide covers the mechanics of the app. The full
            performance experience, including the exact presentation script,
            audience management, how to handle questions, and performance
            psychology, is covered in the PDF guide and video walkthrough
            attached to your purchase confirmation email.
          </Para>
          <Para>
            If you cannot find that email, check your spam folder or contact
            support through the Gumroad purchase page and a copy will be
            sent to you.
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
