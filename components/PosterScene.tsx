import LetterCube, { GraduatePick } from "./LetterCube";
import type { Settings } from "@/lib/types";

const SIZE = "clamp(64px, 21vw, 104px)";

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

export default function PosterScene({
  settings: s,
  picks,
}: {
  settings: Settings;
  picks: GraduatePick[];
}) {
  let cubeIndex = 0;
  const cube = (ch: string, offset: string) => {
    const i = cubeIndex++;
    return (
      <LetterCube key={i} ch={ch} seed={i + 1} size={SIZE} pool={picks} className={offset} />
    );
  };

  return (
    <section className="w-full max-w-md mx-auto px-6 pt-6 overflow-hidden">
      {/* header — like the poster's top right block */}
      <header className="text-right mb-8">
        <h1 className="text-2xl font-bold leading-tight">{s.exh_he}</h1>
        <p className="text-xl leading-loose" lang="ar" dir="rtl">
          {s.exh_ar}
        </p>
        <p className="text-2xl leading-tight" dir="ltr" lang="en">
          {s.exh_en}
        </p>
        <p className="mt-3 text-sm font-bold whitespace-pre-line">{s.faculty_he}</p>
      </header>

      {/* row 1: T R A — dir=ltr so the word reads left-to-right inside the RTL page */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[0].map((ch, i) => cube(ch, OFFSETS[0][i]))}
      </div>

      <h2 className="text-center text-4xl font-black my-6">
        <span
          className="text-transparent"
          style={{ WebkitTextStroke: "1.5px var(--ink)" }}
        >
          {s.title_he.split(" ")[0]}
        </span>{" "}
        {s.title_he.split(" ").slice(1).join(" ")}
      </h2>

      {/* row 2: N S ↑ */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[1].map((ch, i) => cube(ch, OFFSETS[1][i]))}
      </div>

      <h2 className="text-center text-4xl font-black my-6" dir="ltr" lang="en">
        {s.title_en_prefix}
      </h2>

      {/* row 3: T ↑ O */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[2].map((ch, i) => cube(ch, OFFSETS[2][i]))}
      </div>

      <h2
        className="text-center text-4xl font-bold my-6 text-transparent"
        lang="ar"
        dir="rtl"
        style={{ WebkitTextStroke: "1.3px var(--ink)" }}
      >
        {s.title_ar}
      </h2>

      {/* row 4: N + dates block */}
      <div className="flex justify-between items-end mb-4" dir="ltr">
        {ROWS[3].map((ch, i) => cube(ch, OFFSETS[3][i]))}
        <div className="text-left" dir="ltr">
          <p className="text-4xl font-black tracking-tight">{s.dates}</p>
          <p className="text-2xl text-right" dir="rtl">
            {s.opening_he}
          </p>
          <p className="text-2xl">{s.opening_time}</p>
          <p className="mt-2 text-base text-right" dir="rtl">
            {s.location_he}
          </p>
        </div>
      </div>

      <p className="text-center text-sm opacity-60 mt-6 mb-2">
        לחצו על קופסה לגלות פרויקט · <span lang="ar">انقروا على صندوق</span> · Tap a
        box to reveal a project
      </p>
    </section>
  );
}
