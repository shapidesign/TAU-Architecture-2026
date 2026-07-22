"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cube, { ArrowGlyph } from "./Cube";
import { rnd } from "@/lib/rnd";

export type GraduatePick = {
  id: string | null; // graduate id, or null for a schedule-only pick
  name_he: string;
  cover: string | null;
  sched?: string; // presentation slot text, shown when there is no media
};

/**
 * A tumbling letter cube. Tap 1: lid swings open revealing a random
 * graduate's work (image), or their presentation slot if there is no media.
 * Tap 2 within 5s: navigate to that graduate / the schedule.
 * Otherwise it closes itself and re-randomizes for the next tap.
 */
export default function LetterCube({
  ch,
  seed,
  size,
  pool,
  className = "",
}: {
  ch: string; // single letter, "↑" renders the arrow glyph
  seed: number;
  size: string;
  pool: GraduatePick[];
  className?: string;
}) {
  const [pick, setPick] = useState<GraduatePick | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  // freeze the cube at its current mid-tumble rotation so the lid opens in place
  const freezeCube = () => {
    const el = btnRef.current?.querySelector<HTMLElement>(".cube");
    if (el) el.style.transform = getComputedStyle(el).transform;
  };

  const close = () => {
    const el = btnRef.current?.querySelector<HTMLElement>(".cube");
    if (el) el.style.transform = ""; // resume tumbling
    setPick(null);
  };

  const r = (i: number, min: number, max: number) =>
    `${Math.round(min + rnd(seed, i) * (max - min))}deg`;

  const style = {
    "--s": size,
    "--dur": `${(4 + rnd(seed, 9) * 4).toFixed(1)}s`,
    "--delay": `-${(rnd(seed, 10) * 4).toFixed(1)}s`,
    "--rx0": r(1, -32, -6),
    "--ry0": r(2, 8, 42),
    "--rz0": r(3, -14, 6),
    "--rx1": r(4, 6, 34),
    "--ry1": r(5, -44, -8),
    "--rz1": r(6, -6, 14),
  } as React.CSSProperties;

  const glyph =
    ch === "↑" ? (
      <ArrowGlyph />
    ) : (
      <span className="glyph" lang="en">
        {ch}
      </span>
    );

  return (
    <div
      className={`scene3d cube-pop ${className}`}
      style={{ "--pop-delay": `${(seed % 10) * 0.09}s` } as React.CSSProperties}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={
          pick ? `לפרויקט של ${pick.name_he}` : "פתחו את הקופסה לגלות פרויקט"
        }
        onClick={() => {
          if (pick) {
            clearTimeout(timer.current ?? undefined);
            router.push(pick.id ? `/graduates/${pick.id}` : "/schedule");
            return;
          }
          if (pool.length === 0) return;
          freezeCube();
          setPick(pool[Math.floor(Math.random() * pool.length)]);
          // closes by itself, next open reveals a new random graduate
          timer.current = setTimeout(close, 5000);
        }}
        className="block cursor-pointer bg-transparent border-0 p-0"
        style={{ width: size, height: size }}
      >
        <Cube
          content={glyph}
          className={`tumble lidcube ${pick ? "revealed" : ""}`}
          style={style}
          inner={
            pick?.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pick.cover}
                alt={`עבודה של ${pick.name_he}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : pick ? (
              <span
                dir="rtl"
                className="flex flex-col items-center justify-center gap-0.5 w-full h-full p-1 text-center"
              >
                <span className="text-[calc(var(--s)*0.14)] font-bold">
                  {pick.name_he}
                </span>
                {pick.sched && (
                  <span className="text-[calc(var(--s)*0.1)] leading-tight">
                    {pick.sched}
                  </span>
                )}
              </span>
            ) : null
          }
        />
      </button>
    </div>
  );
}
