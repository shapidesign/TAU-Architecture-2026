"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

type Phase = "tape" | "turning" | "diving" | "hidden";

// module state: survives client-side navigation, resets on full page load —
// so the intro plays once per refresh, not on every return to the homepage
let playedThisPageLoad = false;

// each flap carries its half of the cut tape; jagged edge along the cut
const CUT_EDGE_L =
  "polygon(0 0, 100% 0, 94% 6%, 100% 13%, 95% 22%, 100% 30%, 94% 41%, 100% 52%, 95% 61%, 100% 70%, 94% 80%, 100% 89%, 96% 100%, 0 100%)";
const CUT_EDGE_R =
  "polygon(0 0, 100% 0, 100% 100%, 4% 100%, 0 89%, 6% 80%, 0 70%, 5% 61%, 0 52%, 6% 41%, 0 30%, 5% 22%, 0 13%, 6% 6%)";

/**
 * Intro: a sealed cardboard box. Drag cuts the masking tape down its middle
 * (progress accumulates — the cut stays where you leave it). Fully cut, the
 * box turns its opening toward the viewer, the flaps swing open carrying
 * their tape halves, and the camera flies through the mouth into the grey
 * page. Then the letter cubes appear.
 */
export default function IntroBox({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>(() =>
    playedThisPageLoad ? "hidden" : "tape"
  );
  const facing = phase !== "tape" && phase !== "hidden"; // mouth toward viewer
  const cut = useMotionValue(0); // 0..1 accumulated cut progress
  const done = useRef(false);
  const notified = useRef(false);

  // a blade leads the cut front; a dark slit grows behind it
  const cutH = useTransform(cut, (p) => `${Math.min(p, 1) * 100}%`);
  const bladeWobble = useTransform(cut, (p) => Math.sin(p * Math.PI * 6) * 4);
  const bladeOpacity = useTransform(cut, [0, 0.04, 1, 1.08], [0, 1, 1, 0]);
  const tapeOpacity = useTransform(cut, [0, 1, 1.2], [1, 1, 0]);
  // the box strains a little under the blade
  const boxTilt = useTransform(cut, (p) => -p * 2);
  const boxLift = useTransform(cut, (p) => -p * 5);
  const hintOpacity = useTransform(cut, [0, 0.35], [1, 0]);

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
    window.scrollTo(0, 0);
    setPhase("hidden");
    if (!notified.current) {
      notified.current = true;
      onDone?.();
    }
  }

  function open() {
    if (done.current) return;
    done.current = true;
    animate(cut, 1.2, { duration: 0.4, ease: "easeOut" }); // slit finishes, tape overlay yields to the halves
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
        // accumulate distance — the cut never heals
        const next = Math.min(
          1,
          cut.get() +
            Math.abs(info.delta.x) / 340 +
            Math.abs(info.delta.y) / 620
        );
        cut.set(next);
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
        <motion.div className="scene3d" style={{ rotate: boxTilt, y: boxLift }}>
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
              {/* flaps — swing open toward the viewer once the box faces us,
                  each carrying its half of the cut tape */}
              <motion.div
                className="absolute top-0 left-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-left"
                animate={facing ? { rotateY: -150 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 15,
                  delay: 1.0,
                }}
              >
                <div
                  className="masking-tape absolute inset-y-[-6%] right-0 w-[28%]"
                  style={{ clipPath: CUT_EDGE_L }}
                />
              </motion.div>
              <motion.div
                className="absolute top-0 right-0 h-full w-1/2 bg-[var(--box)] border-2 border-[var(--edge)] origin-right"
                animate={facing ? { rotateY: 150 } : { rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 15,
                  delay: 1.15,
                }}
              >
                <div
                  className="masking-tape absolute inset-y-[-6%] left-0 w-[28%]"
                  style={{ clipPath: CUT_EDGE_R }}
                />
              </motion.div>
              {/* masking tape over the seam: uncut overlay + growing slit +
                  blade. When the cut completes the overlay fades, revealing
                  the identical halves stuck to the flaps beneath */}
              <div className="absolute inset-y-[-6%] left-[36%] w-[28%] pointer-events-none">
                <motion.div
                  className="masking-tape absolute inset-0"
                  style={{
                    opacity: tapeOpacity,
                    clipPath:
                      "polygon(0 2%, 25% 0, 50% 2%, 75% 0, 100% 2%, 100% 98%, 78% 100%, 55% 97.5%, 30% 100%, 0 97.5%)",
                  }}
                />
                {/* the cut: a dark slit with lifted, light-catching edges */}
                <motion.div
                  className="tape-cut absolute left-1/2 top-0 w-[2px]"
                  style={{ height: cutH, x: "-50%", opacity: tapeOpacity }}
                />
                {/* blade leading the cut front */}
                <motion.div
                  className="tape-blade absolute left-1/2"
                  style={{
                    top: cutH,
                    x: "-50%",
                    y: "-88%",
                    rotate: bladeWobble,
                    opacity: bladeOpacity,
                  }}
                />
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
        גררו כדי לחתוך את הסרט
        <span className="block text-base font-normal" lang="ar">
          اسحبوا لقطع الشريط
        </span>
        <span className="block text-base font-normal" dir="ltr" lang="en">
          Drag to cut the tape
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
