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
      <div className="mb-4 flex items-center gap-3">
        <span className="font-ui-medium text-[10px] tabular-nums tracking-[3px] text-white/20">{number}</span>
        <div className="h-px flex-1 bg-white/[5%]" />
      </div>
      <h3 className="mb-4 pl-1 font-display-upright text-[24px] leading-none text-white/82">
        {title}
      </h3>
      <div className="space-y-3.5 pl-1">
        {children}
      </div>
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-ui-light text-[15px] leading-[1.82] text-white/54">
      {children}
    </p>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="font-ui-light w-5 shrink-0 pt-0.5 text-[13px] tabular-nums text-white/24">
        {n}.
      </span>
      <p className="font-ui-light text-[15px] leading-[1.8] text-white/58">{children}</p>
    </div>
  );
}

function GestureRow({ gesture, action }: { gesture: string; action: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-white/[5%] py-3 last:border-0">
      <span className="font-ui-light w-32 shrink-0 text-[13px] text-white/34">{gesture}</span>
      <span className="font-ui-light text-[13px] text-white/58">{action}</span>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-white/[7%] bg-white/[2%] px-4 py-4">
      <p className="font-ui-light text-[13px] leading-[1.75] text-white/42">{children}</p>
    </div>
  );
}

function StoreLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between border-b border-white/[5%] py-4 last:border-0 active:opacity-60"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="font-ui-light text-[15px] text-white/60">{label}</span>
      <span className="font-ui-medium text-[11px] uppercase tracking-[2px] text-white/28">Open</span>
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
            className="font-ui-medium text-white/34 text-[11px] tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); setScreen('home'); }}
            onClick={() => setScreen('home')}
          >
            Close
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav pt-4">

        <div className="mb-12 rounded-[30px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-5 py-5">
          <p className="font-ui-medium text-[10px] uppercase tracking-[4px] text-white/24">Overview</p>
          <p className="font-ui-light mt-3 max-w-[290px] text-[15px] leading-[1.8] text-white/58">
            Everything you need for your first reading, reduced to the essentials.
            The full script and handling notes stay in the purchase materials.
          </p>
        </div>

        {/* 01 — Notifications */}
        <Section number="01" title="Setting Up Notifications">
          <Body>
            Results are delivered silently to your watch or a second phone
            via a free app called ntfy. Download it on the device that will
            receive your results.
          </Body>

          <div className="mt-1 rounded-[24px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-5">
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
          <Callout>
            Use the same topic in ntfy and in Singularis. Run one real test before performing.
          </Callout>
        </Section>

        {/* 02 — The Presentation */}
        <Section number="02" title="The Presentation">
          <Body>
            Present this as a life path number calculation. Tell the spectator
            their birthday will never be spoken out loud and that you only need
            two totals from them.
          </Body>
          <Body>Guide them through these three steps:</Body>

          <div className="space-y-4 py-1">
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
            Before you enter any totals, ask the spectator:
            "Which number is bigger, the day you were born or the month?"
            Tap the top half for day, or the bottom half for month.
          </Body>
          <Body>
            Enter the total from Step 2 first, then the total from Step 3.
          </Body>

          <div className="mt-2 rounded-[24px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3">
            <p className="font-ui-medium mb-1 text-[10px] uppercase tracking-[4px] text-white/20">Tapping</p>
            <GestureRow gesture="Bottom half" action="Add 1" />
            <GestureRow gesture="Top half" action="Add 10" />
          </div>

          <div className="mt-2 rounded-[24px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3">
            <p className="font-ui-medium mb-1 text-[10px] uppercase tracking-[4px] text-white/20">Correcting</p>
            <GestureRow gesture="Three fingers" action="Reset to zero" />
            <GestureRow gesture="Swipe left" action="Restart the number entry" />
          </div>

          <div className="mt-2 rounded-[24px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-3">
            <p className="font-ui-medium mb-1 text-[10px] uppercase tracking-[4px] text-white/20">Confirming</p>
            <GestureRow gesture="Long press" action="Confirm and move to next phase" />
            <GestureRow gesture="Two-finger swipe down" action="Exit performance mode" />
          </div>

          <Body>
            The phone vibrates after every action so you always know what
            happened without looking at the screen.
          </Body>
        </Section>

        {/* 04 — Ambiguous */}
        <Section number="04" title="When Two Dates Appear">
          <Body>
            Some birthdays share the same two totals as another birthday.
            That ambiguity is handled before you begin by asking whether the day
            or the month is the larger number.
          </Body>
          <Body>
            Once you have stored that answer, the app resolves those edge cases
            automatically after you enter the anchor and difference totals.
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

        <div className="mb-2 mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[4%]" />
          <p className="font-ui-medium text-[9px] uppercase tracking-[4px] text-white/[12%]">Singularis</p>
          <div className="h-px flex-1 bg-white/[4%]" />
        </div>

      </div>
    </motion.div>
  );
}
