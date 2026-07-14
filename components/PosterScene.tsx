import LetterCube, { GraduatePick } from "./LetterCube";
import type { Settings } from "@/lib/types";

const SIZE = "clamp(64px, 21vw, 104px)";

const OUTLINE: React.CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1.5px var(--ink)",
};

// Admin-controlled scale; fill/outline segmentation follows the printed poster.
function titleStyle(s: Settings, k: string, story: boolean): React.CSSProperties {
  return {
    fontSize: story ? `${Number(s[`${k}_size`]) * 2.15}px` : `min(${s[`${k}_size`]}px, 10.5vw)`,
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

function FoldedArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 112"
      className={`folded-arrow ${flip ? "folded-arrow-flip" : ""}`}
    >
      <path
        d="M12 8h55v47h22L49 104 9 55h22V27H12z"
        fill="var(--box)"
        stroke="var(--edge)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M31 27 67 8v47h22L49 104V55H31z"
        fill="var(--box-side)"
        stroke="var(--edge)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m9 55 40 49V55z" fill="var(--box)" stroke="var(--edge)" strokeWidth="2" />
    </svg>
  );
}

export default function PosterScene({
  settings: s,
  picks,
  story = false,
}: {
  settings: Settings;
  picks: GraduatePick[];
  story?: boolean;
}) {
  let cubeIndex = 0;
  const cubeSize = story ? "190px" : SIZE;
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
      className={`poster-scene w-full max-w-md mx-auto px-6 pt-6 overflow-hidden ${
        story ? "poster-story" : ""
      }`}
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
        <SplitTitle
          filled={s.title_ar.split(" ").slice(0, -1).join(" ")}
          outlined={s.title_ar.split(" ").slice(-1).join(" ")}
        />
      </h2>

      {/* final N, followed by the two folded arrows from the printed poster */}
      <div className="poster-final-row flex justify-between items-end mb-3" dir="ltr">
        {ROWS[3].map((ch, i) => cube(ch, OFFSETS[3][i]))}
        <div className="flex flex-1 justify-end items-end -space-x-3 ms-5">
          <FoldedArrow />
          <FoldedArrow flip />
        </div>
      </div>

      <div className="poster-details flex justify-between items-end gap-5 mb-4" dir="ltr">
        <p className="location-copy text-left whitespace-pre-line" dir="rtl">
          {s.location_he}
        </p>
        <div className="date-copy text-right ms-auto" dir="rtl">
          <p className="date-number font-black tracking-tight" dir="ltr">
            {s.dates}
          </p>
          <p className="event-line">{s.opening_he}</p>
          <p className="event-line" dir="ltr">
            {s.opening_time}
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
