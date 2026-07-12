import LetterCube, { GraduatePick } from "./LetterCube";
import type { Settings } from "@/lib/types";

const SIZE = "clamp(64px, 21vw, 104px)";

const OUTLINE: React.CSSProperties = {
  color: "transparent",
  WebkitTextStroke: "1.5px var(--ink)",
};

// admin-controlled typography for a title line (size/weight/leading/outline)
function titleStyle(s: Settings, k: string): React.CSSProperties {
  return {
    fontSize: `min(${s[`${k}_size`]}px, 9.5vw)`,
    fontWeight: Number(s[`${k}_weight`]) || 900,
    lineHeight: Number(s[`${k}_lh`]) || 1.15,
    ...(s[`${k}_style`] === "outline" ? OUTLINE : {}),
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
      {/* admin-uploaded logo, physical left/right (dir=ltr so it's not RTL-flipped) */}
      {s.logo_url && (
        <div
          dir="ltr"
          className={`flex mb-4 ${s.logo_pos === "left" ? "justify-start" : "justify-end"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.logo_url} alt="לוגו" className="h-12 w-auto" />
        </div>
      )}

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

      <h2 className="text-center my-6" style={titleStyle(s, "t_he")}>
        {s.t_he_style === "mixed" ? (
          <>
            <span style={OUTLINE}>{s.title_he.split(" ")[0]}</span>{" "}
            {s.title_he.split(" ").slice(1).join(" ")}
          </>
        ) : (
          s.title_he
        )}
      </h2>

      {/* row 2: N S ↑ */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[1].map((ch, i) => cube(ch, OFFSETS[1][i]))}
      </div>

      <h2
        className="text-center my-6"
        dir="ltr"
        lang="en"
        style={titleStyle(s, "t_en")}
      >
        {s.title_en_prefix}
      </h2>

      {/* row 3: T ↑ O */}
      <div className="flex justify-between items-start" dir="ltr">
        {ROWS[2].map((ch, i) => cube(ch, OFFSETS[2][i]))}
      </div>

      <h2 className="text-center my-6" lang="ar" dir="rtl" style={titleStyle(s, "t_ar")}>
        {s.title_ar}
      </h2>

      {/* row 4: N + dates block */}
      <div className="flex justify-between items-end mb-4" dir="ltr">
        {ROWS[3].map((ch, i) => cube(ch, OFFSETS[3][i]))}
        <div className="text-right ms-auto">
          <p className="text-4xl font-black tracking-tight" dir="ltr">
            {s.dates}
          </p>
          <p className="text-2xl" dir="rtl">
            {s.opening_he}
          </p>
          <p className="text-2xl" dir="ltr">
            {s.opening_time}
          </p>
          <p className="mt-2 text-base" dir="rtl">
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
