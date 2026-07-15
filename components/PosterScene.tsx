import LetterCube, { GraduatePick } from "./LetterCube";
import { rnd } from "@/lib/rnd";
import type { Settings } from "@/lib/types";

const SIZE = "var(--poster-cube-size)";

const OUTLINE: React.CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1.5px var(--ink)",
};

// export render modes: false = website, "916" = 1080x1920 story, "45" = 1080x1350 post
export type StoryMode = false | "916" | "45";

// Admin-controlled scale; fill/outline segmentation follows the printed poster.
function titleStyle(s: Settings, k: string, story: StoryMode): React.CSSProperties {
  const scale = story === "45" ? 1.5 : 2.15;
  return {
    fontSize: story ? `${Number(s[`${k}_size`]) * scale}px` : `min(${s[`${k}_size`]}px, 10.5vw)`,
    fontWeight: Number(s[`${k}_weight`]) || 900,
    lineHeight: Number(s[`${k}_lh`]) || 1.15,
  };
}

// TRANSITION split into poster rows; "↑" = the arrow-I glyph
const ROWS: string[][] = [
  ["T", "R", "A"],
  ["N", "S", "↑"],
  ["T", "↑", "O"],
  ["N"],
];

// vertical scatter per cube, poster-style
const OFFSETS = [
  ["mt-2", "-mt-4", "mt-5"],
  ["mt-6", "mt-0", "-mt-3"],
  ["mt-1", "mt-7", "-mt-2"],
  ["mt-0"],
];

function SplitTitle({
  filled,
  outlined,
}: {
  filled: string;
  outlined: string;
}) {
  return (
    <>
      <span>{filled}</span>{" "}
      <span style={OUTLINE}>{outlined}</span>
    </>
  );
}

function ArabicTitle({
  filled,
  outlined,
  story,
}: {
  filled: string;
  outlined: string;
  story: StoryMode;
}) {
  const filterId = `arabic-union-outline-${story ? "story" : "web"}`;
  return (
    <>
      <span className="sr-only">{`${filled} ${outlined}`}</span>
      <span aria-hidden="true">
        {filled}{" "}
        <span className="arabic-outline" style={{ filter: `url(#${filterId})` }}>
          {outlined}
        </span>
      </span>
      <svg className="absolute size-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-8%" y="-16%" width="116%" height="132%">
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius={story ? "3.2" : "1.5"}
              result="expanded"
            />
            <feComposite in="expanded" in2="SourceAlpha" operator="out" result="outline" />
            <feFlood floodColor="var(--ink)" result="ink" />
            <feComposite in="ink" in2="outline" operator="in" />
          </filter>
        </defs>
      </svg>
    </>
  );
}

// line-style up-right arrow (stroked shaft + open chevron head, not a
// solid triangle), same silhouette on every extrusion layer
const ARROW_PATH = "M12 50 H78 M52 24 L84 50 L52 76";
const ARROW_FIT = "rotate(-45 50 50)";
// ponytail: fake extrusion — stacked Z layers instead of real side walls.
// Holds up at the cube tumble angles (±45°); real walls need a 3D lib.
const ARROW_LAYERS = 15;
const ARROW_DEPTH = 0.42; // slab depth as a fraction of --s

/** Extruded 3D arrow living in the cube grid: same tumble + pop-in as cubes. */
function Arrow3D({ seed, size }: { seed: number; size: string }) {
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

  return (
    <div
      aria-hidden="true"
      className="scene3d cube-pop"
      style={{ "--pop-delay": `${(seed % 10) * 0.09}s` } as React.CSSProperties}
    >
      <div className="cube arrow3d tumble" style={style}>
        {Array.from({ length: ARROW_LAYERS }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 100 100"
            className={`arrow-layer ${
              i === ARROW_LAYERS - 1 ? "arrow-front" : i === 0 ? "arrow-back" : ""
            }`}
            style={{
              transform: `translateZ(calc(var(--s) * ${(
                (i / (ARROW_LAYERS - 1) - 0.5) *
                ARROW_DEPTH
              ).toFixed(3)}))`,
            }}
          >
            <g transform={ARROW_FIT}>
              {i === ARROW_LAYERS - 1 && (
                <path d={ARROW_PATH} className="arrow-edge" />
              )}
              <path d={ARROW_PATH} />
            </g>
          </svg>
        ))}
      </div>
    </div>
  );
}

export default function PosterScene({
  settings: s,
  picks,
  story = false,
}: {
  settings: Settings;
  picks: GraduatePick[];
  story?: StoryMode;
}) {
  let cubeIndex = 0;
  const [submissionDate = "9-13.8", submissionLabel = "הגשות פתוחות"] =
    s.opening_time.split(/\s+-\s+/, 2);
  const cubeSize = story === "45" ? "144px" : story ? "208px" : SIZE;
  const cube = (ch: string, offset: string) => {
    const i = cubeIndex++;
    return (
      <LetterCube
        key={i}
        ch={ch}
        seed={i + 1}
        size={cubeSize}
        pool={picks}
        className={offset}
      />
    );
  };

  return (
    <section
      className={`poster-scene w-full mx-auto px-6 pt-6 overflow-hidden ${
        story ? "poster-story" : ""
      } ${story === "45" ? "poster-45" : ""}`}
    >
      <div className="poster-top flex justify-between items-start gap-4 mb-8" dir="ltr">
        <div className="w-[48%] pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-horizontal-8.png"
            alt="אוניברסיטת תל אביב ובית הספר לאדריכלות"
            className="w-full h-auto"
          />
        </div>
        <header className="w-[48%] text-right" dir="rtl">
          <h1 className="exhibition-title font-bold">{s.exh_he}</h1>
          <p className="exhibition-title" lang="ar" dir="rtl">
            {s.exh_ar}
          </p>
          <p className="exhibition-title" dir="ltr" lang="en">
            {s.exh_en}
          </p>
          <p className="faculty-title mt-1 font-bold whitespace-pre-line">{s.faculty_he}</p>
        </header>
      </div>

      {/* row 1: T R A — dir=ltr so the word reads left-to-right inside the RTL page */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[0].map((ch, i) => cube(ch, OFFSETS[0][i]))}
      </div>

      <h2 className="poster-title text-center my-5" style={titleStyle(s, "t_he", story)}>
        <SplitTitle
          filled={s.title_he.split(" ")[0]}
          outlined={s.title_he.split(" ").slice(1).join(" ")}
        />
      </h2>

      {/* row 2: N S ↑ */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[1].map((ch, i) => cube(ch, OFFSETS[1][i]))}
      </div>

      <h2
        className="poster-title text-center my-5"
        dir="ltr"
        lang="en"
        style={titleStyle(s, "t_en", story)}
      >
        <SplitTitle
          filled={s.title_en_prefix.split(" ")[0]}
          outlined={s.title_en_prefix.split(" ").slice(1).join(" ")}
        />
      </h2>

      {/* row 3: T ↑ O */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[2].map((ch, i) => cube(ch, OFFSETS[2][i]))}
      </div>

      <h2
        className="poster-title text-center my-5"
        lang="ar"
        dir="rtl"
        style={titleStyle(s, "t_ar", story)}
      >
        <ArabicTitle
          filled={s.title_ar.split(" ").slice(0, -1).join(" ")}
          outlined={s.title_ar.split(" ").slice(-1).join(" ")}
          story={story}
        />
      </h2>

      {/* final N + two 3D arrows: same 3-slot justify-between grid as the
          cube rows so the arrows align with the center/right cube columns */}
      <div className="poster-final-row flex justify-between items-end mb-3" dir="ltr">
        {ROWS[3].map((ch, i) => cube(ch, OFFSETS[3][i]))}
        <Arrow3D seed={11} size={`calc(${cubeSize} * 1.15)`} />
        <Arrow3D seed={12} size={`calc(${cubeSize} * 1.15)`} />
      </div>

      <div className="poster-details flex justify-between items-end gap-5 mb-4" dir="ltr">
        <p className="location-copy text-left whitespace-pre-line" dir="rtl">
          {s.location_he}
        </p>
        <div className="date-copy" dir="rtl">
          <p className="date-number font-black tracking-tight" dir="ltr">
            {s.dates}
          </p>
          <p className="event-line">{s.opening_he}</p>
          <p className="event-line bidi-event" dir="ltr" aria-label={s.opening_time}>
            <span aria-hidden="true">
              <bdi dir="rtl">{submissionLabel}</bdi>
              <span> - </span>
              <bdi dir="ltr">{submissionDate}</bdi>
            </span>
          </p>
        </div>
      </div>

      {!story && (
        <p className="text-center text-sm opacity-60 mt-6 mb-2">
          לחצו על קופסה לגלות פרויקט · <span lang="ar">انقروا على صندوق</span> · Tap
          a box to reveal a project
        </p>
      )}
    </section>
  );
}
