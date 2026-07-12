"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type Phase = "tape" | "turning" | "diving" | "hidden";

// module state: survives client-side navigation, resets on full page load —
// so the intro plays once per refresh, not on every return to the homepage
let playedThisPageLoad = false;

/**
 * Intro: a sealed cardboard box. Drag peels the masking tape (progress
 * accumulates — the tape stays where you leave it). Fully peeled, the box
 * turns its opening toward the viewer, the flaps swing open, and the camera
 * flies through the mouth into the grey page. Then the letter cubes appear.
 */
export default function IntroBox({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>(() =>
    playedThisPageLoad ? "hidden" : "tape"
  );
  const facing = phase !== "tape" && phase !== "hidden"; // mouth toward viewer
  const peel = useMotionValue(0); // 0..1 accumulated peel progress
  const done = useRef(false);
  const notified = useRef(false);

  // realistic peel: the stuck strip shortens while a roll of tape grows at
  // the peel front, travels along the seam, and finally rips off
  const remH = useTransform(peel, (p) => `${Math.max(0, (1 - p) * 100)}%`);
  const rollH = useTransform(peel, (p) => `${7 + Math.min(p, 1) * 15}%`);
  const rollTop = useTransform(
    peel,
    (p) => `calc(${(1 - p) * 100}% - ${(7 + Math.min(p, 1) * 15) / 2}%)`
  );
  const rollSpin = useTransform(peel, (p) => `${p * -80}px`); // surface rolling
  const rollWobble = useTransform(peel, (p) => -p * 9);
  const rollShadow = useTransform(
    peel,
    (p) => `0 ${2 + p * 12}px ${6 + p * 16}px rgba(0,0,0,${0.18 + p * 0.22})`
  );
  const tapeOpacity = useTransform(peel, [0, 1, 1.35], [1, 1, 0]);
  // the box strains a little as the tape is pulled
  const boxTilt = useTransform(peel, (p) => -p * 5);
  const hintOpacity = useTransform(peel, [0, 0.35], [1, 0]);

  useEffect(() => {
    playedThisPageLoad = true;
    if (
      phase === "hidden" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "hidden") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [phase]);

  function finish() {
    document.body.style.overflow = "";
    setPhase("hidden");
    if (!notified.current) {
      notified.current = true;
      onDone?.();
    }
  }

  function open() {
    if (done.current) return;
    done.current = true;
    animate(peel, 1.5, { duration: 0.4, ease: "easeIn" }); // tape rips off
    setPhase("turning"); // box rotates, mouth to camera, flaps swing open
    setTimeout(() => setPhase("diving"), 1900); // fly through the mouth
  }

  if (phase === "hidden") return null;

  // ---- sealed box → peel → turn to face viewer → dive through the mouth ----
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[var(--bg)] touch-none select-none flex flex-col items-center justify-center gap-12 cursor-grab active:cursor-grabbing"
      // the camera flies straight through the box mouth
      style={{ transformOrigin: "50% 42%" }}
      animate={phase === "diving" ? { scale: 13 } : { scale: 1 }}
      transition={{ duration: 1.1, ease: [0.7, 0, 0.9, 0.6] }}
      onAnimationComplete={() => phase === "diving" && finish()}
      onPan={(_, info) => {
        if (done.current) return;
        // accumulate distance — the tape never re-sticks
        const next = Math.min(
          1,
          peel.get() +
            Math.abs(info.delta.x) / 340 +
            Math.abs(info.delta.y) / 620
        );
        peel.set(next);
        if (next >= 1) open();
      }}
    >
      {/* idle wobble wrapper — the box rocks gently, waiting */}
      <motion.div
        animate={
          facing ? { rotate: 0, scale: 1.06 } : { rotate: [0, -1.6, 0, 1.6, 0] }
        }
        transition={
          facing
            ? { duration: 0.9, ease: "easeInOut" }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div className="scene3d" style={{ rotate: boxTilt }}>
          <motion.div
            className="cube"
            style={{ "--s": "min(58vw, 280px)" } as React.CSSProperties}
            initial={{ rotateX: -30, rotateY: 36 }}
            // the opening turns to face the viewer
            animate={facing ? { rotateX: -92, rotateY: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.55, 0.1, 0.3, 1] }}
          >
            <div className="face f-front" />
            <div className="face f-back" />
            <div className="face f-right" />
            <div className="face f-left" />
            <div className="face f-bottom" />
            {/* top face: grey interior + two flaps + tape.
                overflow must stay visible: overflow:hidden would clip the
                flaps and flatten their 3D rotation */}
            <div
              className="face f-top !bg-transparent !border-0 !overflow-visible"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute inset-0 border-2 border-[var(--edge)] bg-[var(--bg)]" />
              {/* flaps — swing open toward the viewer once the box faces us */}
              <motion.div
                className="absolute top-0 left-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-left"
                animate={facing ? { rotateY: -150 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 15,
                  delay: 1.0,
                }}
              />
              <motion.div
                className="absolute top-0 right-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-right"
                animate={facing ? { rotateY: 150 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 15,
                  delay: 1.15,
                }}
              />
              {/* masking tape over the seam: stuck strip + rolling peel front */}
              <div className="absolute inset-y-[-6%] left-[36%] w-[28%] pointer-events-none">
                {/* remaining stuck tape, torn edge at the peel front */}
                <motion.div
                  className="absolute inset-x-0 top-0 bg-[#f3eedf]/95"
                  style={{
                    height: remH,
                    clipPath:
                      "polygon(0 2%, 25% 0, 50% 2%, 75% 0, 100% 2%, 100% 98%, 78% 100%, 55% 97.5%, 30% 100%, 0 97.5%)",
                  }}
                />
                {/* the roll — grows as it swallows tape, surface spins */}
                <motion.div
                  className="absolute inset-x-[-18%] rounded-full overflow-hidden"
                  style={{
                    top: rollTop,
                    height: rollH,
                    rotate: rollWobble,
                    opacity: tapeOpacity,
                    boxShadow: rollShadow,
                    background:
                      "linear-gradient(to bottom, #fcf8ec 0%, #f3eedf 40%, #cfc8b0 82%, #e8e2cf 100%)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to top, rgba(0,0,0,0.06) 0 2px, transparent 2px 6px)",
                      backgroundPositionY: rollSpin,
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* grey swallows the screen as the camera passes through the mouth */}
      <motion.div
        className="absolute inset-0 bg-[var(--bg)] pointer-events-none"
        initial={false}
        animate={{ opacity: phase === "diving" ? 1 : 0 }}
        transition={{ duration: 0.35, delay: phase === "diving" ? 0.7 : 0 }}
      />

      <motion.p
        style={{ opacity: hintOpacity }}
        className="text-center text-lg font-bold leading-relaxed animate-pulse px-8"
      >
        גררו כדי לקלף את הסרט
        <span className="block text-base font-normal" lang="ar">
          اسحبوا لنزع الشريط
        </span>
        <span className="block text-base font-normal" dir="ltr" lang="en">
          Drag to peel the tape
        </span>
      </motion.p>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm underline underline-offset-4 opacity-60 min-h-11 px-4 cursor-pointer"
      >
        דילוג · تخطي · Skip
      </button>
    </motion.div>
  );
}
