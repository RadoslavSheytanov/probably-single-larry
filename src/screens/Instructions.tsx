import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import ScreenHeader from '../components/ScreenHeader';

function Section({ number, title, children }: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-white/20 text-[10px] tracking-[3px] tabular-nums">{number}</span>
        <div className="h-px flex-1 bg-white/[6%]" />
      </div>
      <h3 className="font-display text-[26px] text-white/80 leading-none mb-5 pl-1">
        {title}
      </h3>
      <div className="space-y-4 pl-1">
        {children}
      </div>
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/50 text-[15px] leading-[1.8] font-light">
      {children}
    </p>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="text-white/20 text-[13px] font-light tabular-nums shrink-0 pt-0.5 w-5">
        {n}.
      </span>
      <p className="text-white/55 text-[15px] font-light leading-[1.8]">{children}</p>
    </div>
  );
}

function GestureRow({ gesture, action }: { gesture: string; action: string }) {
  return (
    <div className="flex items-baseline gap-4 py-3 border-b border-white/[5%] last:border-0">
      <span className="text-white/35 text-[13px] font-light w-36 shrink-0">{gesture}</span>
      <span className="text-white/55 text-[13px] font-light">{action}</span>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-white/[8%] pl-4 py-1">
      <p className="text-white/35 text-[13px] font-light leading-[1.8]">{children}</p>
    </div>
  );
}

function StoreLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-3.5 border-b border-white/[5%] last:border-0 active:opacity-60"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-white/55 text-[15px] font-light">{label}</span>
      <span className="text-white/25 text-[11px] tracking-[2px] uppercase">Open</span>
    </a>
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

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav pt-4">

        <p className="text-white/30 text-[14px] leading-[1.8] font-light mb-12">
          Everything you need to perform your first reading.
          The full presentation script and advanced handling are in the PDF
          and video sent to your email after purchase.
        </p>

        {/* 01 — Notifications */}
        <Section number="01" title="Setting Up Notifications">
          <Body>
            Results are delivered silently to your watch or a second phone
            via a free app called ntfy. Download it on the device that will
            receive your results.
          </Body>

          <div className="rounded-xl border border-white/[8%] px-5 mt-2">
            <StoreLink
              label="Ntfy — iOS"
              url="https://apps.apple.com/us/app/ntfy/id1625396347"
            />
            <StoreLink
              label="Ntfy — Android"
              url="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
            />
          </div>

          <Body>
            Open ntfy and subscribe to any short topic name you choose.
            Pick something personal and non-obvious.
          </Body>
          <Body>
            Then open Settings in this app and enter that same topic.
            Use Practice Mode to confirm it is working before you perform.
          </Body>
        </Section>

        {/* 02 — The Presentation */}
        <Section number="02" title="The Presentation">
          <Body>
            Present this as a life path number calculation. Tell the spectator
            their birthday will never be spoken out loud and that you only need
            two totals from them.
          </Body>
          <Body>Ask them to follow these three steps:</Body>

          <div className="space-y-4 py-2">
            <Step n={1}>
              Take your birth month as a number. January is 1, December is 12.
            </Step>
            <Step n={2}>
              Add your birth day to that number. Tell me the total.
            </Step>
            <Step n={3}>
              Now take your month and your day again. Subtract the smaller from
              the larger. Tell me that number too.
            </Step>
          </div>

          <Callout>
            Example: born June 14. Step 2 gives 6 + 14 = 20.
            Step 3 gives 14 minus 6 = 8. The app recovers June 14 and
            the star sign Gemini from just those two numbers.
          </Callout>
        </Section>

        {/* 03 — Performance Mode */}
        <Section number="03" title="Entering the Numbers">
          <Body>
            Tap Start Performance. The screen goes black. Put the phone in
            your pocket with the screen facing your leg. The four dots at the
            bottom tell you which phase you are in.
          </Body>
          <Body>
            Enter the total from Step 2 first, then the total from Step 3.
          </Body>

          <div className="mt-2">
            <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-1">Tapping</p>
            <GestureRow gesture="Bottom half" action="Add 1" />
            <GestureRow gesture="Top half" action="Add 10" />
          </div>

          <div className="mt-2">
            <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-1">Correcting</p>
            <GestureRow gesture="Double tap" action="Undo last tap" />
            <GestureRow gesture="Three fingers" action="Reset to zero" />
            <GestureRow gesture="Swipe left" action="Go back to previous number" />
          </div>

          <div className="mt-2">
            <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-1">Confirming</p>
            <GestureRow gesture="Long press" action="Confirm and move to next phase" />
            <GestureRow gesture="Swipe down" action="Exit performance mode" />
          </div>

          <Body>
            The phone vibrates after every action so you always know what
            happened without looking at the screen.
          </Body>
        </Section>

        {/* 04 — Ambiguous */}
        <Section number="04" title="When Two Dates Appear">
          <Body>
            Some birthdays share the same two numbers as another birthday.
            When this happens the screen shows both possibilities and vibrates twice.
          </Body>
          <Body>
            The earlier date is always on the top half.
            The later date is always on the bottom half.
          </Body>
          <Body>
            Ask a natural follow-up question such as "Is your birthday in
            the first half of the year or the second?" then tap the correct half.
            The result is sent to your watch.
          </Body>
        </Section>

        {/* 05 — Learn More */}
        <Section number="05" title="Learn More">
          <Body>
            The full performance experience, including the exact presentation
            script, how to handle questions, and performance psychology,
            is in the PDF guide and video sent to your purchase confirmation email.
          </Body>
          <Body>
            If you cannot find that email, check your spam folder or contact
            support through your Gumroad purchase page.
          </Body>
        </Section>

        <div className="flex items-center gap-3 mt-4 mb-2">
          <div className="h-px flex-1 bg-white/[4%]" />
          <p className="text-white/[10%] text-[9px] tracking-[4px] uppercase">Singularis</p>
          <div className="h-px flex-1 bg-white/[4%]" />
        </div>

      </div>
    </motion.div>
  );
}
