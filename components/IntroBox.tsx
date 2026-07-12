"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type Phase = "tape" | "opening" | "diving" | "hidden";

/**
 * Fullscreen intro: a closed cardboard box sealed with masking tape.
 * Dragging peels the tape along the seam; progress accumulates and the
 * tape STAYS where you leave it (no spring back). When fully peeled the
 * flaps burst open and the camera dives into the box.
 * Shown on every visit; skipped only for prefers-reduced-motion.
 */
export default function IntroBox() {
  const [phase, setPhase] = useState<Phase>("tape");
  const opening = phase === "opening" || phase === "diving";
  const peel = useMotionValue(0); // 0..1 accumulated peel progress
  const done = useRef(false);

  // tape peels along the seam, lifting and shearing as it goes
  const tapeY = useTransform(peel, (p) => `${-p * 165}%`);
  const tapeRot = useTransform(peel, (p) => -p * 26);
  const tapeSkew = useTransform(peel, (p) => p * 10);
  const tapeShadow = useTransform(
    peel,
    (p) => `0 ${4 + p * 22}px ${8 + p * 26}px rgba(0,0,0,${0.15 + p * 0.3})`
  );
  const tapeOpacity = useTransform(peel, [0, 1, 1.35], [1, 1, 0]);
  // the box strains a little as the tape is pulled
  const boxTilt = useTransform(peel, (p) => -p * 5);
  const hintOpacity = useTransform(peel, [0, 0.35], [1, 0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hidden");
    }
  }, []);

  useEffect(() => {
    if (phase === "tape" || phase === "opening") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [phase]);

  function finish() {
    document.body.style.overflow = "";
    setPhase("hidden");
  }

  function open() {
    if (done.current) return;
    done.current = true;
    animate(peel, 1.5, { duration: 0.4, ease: "easeIn" }); // tape rips off
    setPhase("opening");
    setTimeout(() => setPhase("diving"), 1100);
  }

  if (phase === "hidden") return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[var(--bg)] touch-none select-none flex flex-col items-center justify-center gap-12 cursor-grab active:cursor-grabbing"
      animate={
        phase === "diving" ? { scale: 8, rotate: -4, opacity: 0 } : { opacity: 1 }
      }
      transition={{ duration: 1, ease: [0.6, 0, 0.85, 0.5] }}
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
          opening
            ? { rotate: 0, scale: [1, 1.05, 1] }
            : { rotate: [0, -1.6, 0, 1.6, 0] }
        }
        transition={
          opening
            ? { duration: 0.7 }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div className="scene3d" style={{ rotate: boxTilt }}>
          <div
            className="cube"
            style={
              {
                "--s": "min(58vw, 280px)",
                transform: "rotateX(-30deg) rotateY(36deg)",
              } as React.CSSProperties
            }
          >
            <div className="face f-front" />
            <div className="face f-back" />
            <div className="face f-right" />
            <div className="face f-left" />
            <div className="face f-bottom" />
            {/* top face: interior + two flaps + tape */}
            <div
              className="face f-top !bg-transparent !border-0"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* box interior with a peek of small boxes */}
              <div className="absolute inset-0 border-2 border-[var(--edge)] bg-[color-mix(in_srgb,var(--box),black_58%)] flex items-center justify-center gap-[6%] overflow-hidden">
                {[12, -8, 20].map((r) => (
                  <motion.div
                    key={r}
                    className="w-[22%] aspect-square bg-[var(--box)] opacity-90"
                    style={{ rotate: r }}
                    animate={opening ? { y: "-12%" } : { y: "18%" }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                  />
                ))}
              </div>
              {/* flaps — hinge on outer edges, spring open with overshoot */}
              <motion.div
                className="absolute top-0 left-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-left"
                animate={opening ? { rotateY: -165 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 14,
                  delay: 0.3,
                }}
              />
              <motion.div
                className="absolute top-0 right-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-right"
                animate={opening ? { rotateY: 165 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 14,
                  delay: 0.42,
                }}
              />
              {/* masking tape over the seam — peels along it */}
              <motion.div
                className="absolute inset-y-[-10%] left-[36%] w-[28%] bg-[#f3eedf]/95"
                style={{
                  y: tapeY,
                  rotate: tapeRot,
                  skewY: tapeSkew,
                  opacity: tapeOpacity,
                  boxShadow: tapeShadow,
                  clipPath:
                    "polygon(0 3%, 25% 0, 50% 3%, 75% 0, 100% 3%, 100% 97%, 75% 100%, 50% 97%, 25% 100%, 0 97%)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

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
