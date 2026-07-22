"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  parseJson,
  type DirectionSpot,
  type Graduate,
  type Presenter,
  type Settings,
  type Studio,
} from "@/lib/types";
import {
  createGraduate,
  deleteGraduate,
  logoutAction,
  removeLogo,
  saveJsonSetting,
  saveLogo,
  saveSettings,
  updateGraduate,
} from "../actions";

const TABS = [
  ["invite", "הזמנה"],
  ["grads", "בוגרים.ות"],
  ["schedule", "מועדי הגשות"],
  ["directions", "דרכי הגעה"],
  ["theme", "צבעים"],
] as const;

const TYPO_ROWS: [string, string][] = [
  ["t_he", "כותרת עברית — אדריכלות במעבר"],
  ["t_en", "כותרת אנגלית — Architecture in"],
  ["t_ar", "כותרת ערבית"],
];

const INVITE_FIELDS: [string, string][] = [
  ["exh_he", "כותרת התערוכה — עברית"],
  ["exh_en", "כותרת התערוכה — English"],
  ["exh_ar", "כותרת התערוכה — عربي"],
  ["faculty_he", "שם הפקולטה"],
  ["title_he", "שם התערוכה — עברית"],
  ["title_en_prefix", "טקסט לפני TRANSITION — English"],
  ["title_ar", "שם התערוכה — عربي"],
  ["dates", "תאריכים"],
  ["opening_he", "טקסט אירוע הפתיחה"],
  ["opening_time", "מועד הפתיחה"],
  ["location_he", "מיקום"],
];

function Save({ label = "שמירה" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[var(--ink)] text-[var(--box)] px-6 py-2.5 font-bold disabled:opacity-50 cursor-pointer min-h-11"
    >
      {pending ? "שומר…" : label}
    </button>
  );
}

const input =
  "border-2 border-[var(--ink)] bg-white px-3 py-2.5 text-base w-full";
const label = "flex flex-col gap-1 text-sm font-bold";

function GraduateFields({ g }: { g?: Graduate }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className={label}>
        שם — עברית
        <input name="name_he" defaultValue={g?.name_he} required className={input} />
      </label>
      <label className={label}>
        שם — English
        <input name="name_en" defaultValue={g?.name_en} dir="ltr" className={input} />
      </label>
      <label className={label}>
        שם — عربي
        <input name="name_ar" defaultValue={g?.name_ar} className={input} />
      </label>
      <label className={label}>
        שם הפרויקט
        <input name="title" defaultValue={g?.title} className={input} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        תיאור הפרויקט
        <textarea
          name="description"
          defaultValue={g?.description}
          rows={4}
          className={input}
        />
      </label>
      <label className={label}>
        וידאו (YouTube / Vimeo / mp4)
        <input name="video_url" defaultValue={g?.video_url} dir="ltr" className={input} />
      </label>
      <label className={label}>
        לינק חיצוני
        <input name="link_url" defaultValue={g?.link_url} dir="ltr" className={input} />
      </label>
      <label className={label}>
        סדר תצוגה (קטן = ראשון)
        <input
          name="sort_order"
          type="number"
          defaultValue={g?.sort_order ?? 0}
          className={input}
        />
      </label>
      <label className={label}>
        הוספת תמונות
        <input
          name="new_images"
          type="file"
          accept="image/*"
          multiple
          className={`${input} bg-white/60`}
        />
      </label>
      {g && g.images.length > 0 && (
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-bold mb-2">
            תמונות קיימות (בטלו סימון כדי למחוק בשמירה)
          </legend>
          <div className="flex flex-wrap gap-3">
            {g.images.map((src) => (
              <label key={src} className="relative block w-24 cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="w-24 h-24 object-cover border-2 border-[var(--ink)]"
                />
                <input
                  type="checkbox"
                  name="kept_images"
                  value={src}
                  defaultChecked
                  className="absolute top-1 right-1 w-5 h-5 accent-[var(--ink)]"
                />
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}

const EMPTY_PRESENTER: Presenter = { name: "", time: "", location: "" };
const EMPTY_STUDIO: Studio = { name: "", date: "", location: "", presenters: [] };
const EMPTY_SPOT: DirectionSpot = { name: "", note: "", maps_url: "", waze_url: "" };

const smallBtn =
  "border-2 border-[var(--ink)] bg-[var(--box)] px-3 py-1.5 text-sm font-bold cursor-pointer min-h-9";
const delBtn =
  "text-red-700 text-sm underline underline-offset-4 cursor-pointer min-h-9";

function ScheduleEditor({ initial }: { initial: Studio[] }) {
  const [studios, setStudios] = useState<Studio[]>(initial);

  const setStudio = (i: number, patch: Partial<Studio>) =>
    setStudios((s) => s.map((st, j) => (j === i ? { ...st, ...patch } : st)));
  const setPresenter = (i: number, p: number, patch: Partial<Presenter>) =>
    setStudio(i, {
      presenters: studios[i].presenters.map((pr, j) =>
        j === p ? { ...pr, ...patch } : pr
      ),
    });

  return (
    <form action={saveJsonSetting} className="flex flex-col gap-6">
      <input type="hidden" name="key" value="schedule_json" />
      <input type="hidden" name="value" value={JSON.stringify(studios)} />

      {studios.map((st, i) => (
        <fieldset key={i} className="border-2 border-[var(--ink)] p-4 bg-[var(--box)]/40 flex flex-col gap-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <label className={label}>
              שם הסטודיו
              <input
                value={st.name}
                onChange={(e) => setStudio(i, { name: e.target.value })}
                className={input}
              />
            </label>
            <label className={label}>
              תאריך
              <input
                value={st.date}
                onChange={(e) => setStudio(i, { date: e.target.value })}
                placeholder="10.8"
                className={input}
              />
            </label>
            <label className={label}>
              מיקום
              <input
                value={st.location}
                onChange={(e) => setStudio(i, { location: e.target.value })}
                className={input}
              />
            </label>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-right">
                <th className="border-2 border-[var(--ink)] px-2 py-1.5 bg-[var(--box)]">שם הבוגר.ת</th>
                <th className="border-2 border-[var(--ink)] px-2 py-1.5 bg-[var(--box)] w-28">שעה</th>
                <th className="border-2 border-[var(--ink)] px-2 py-1.5 bg-[var(--box)]">מיקום</th>
                <th className="border-2 border-[var(--ink)] px-2 py-1.5 bg-[var(--box)] w-16" />
              </tr>
            </thead>
            <tbody>
              {st.presenters.map((pr, p) => (
                <tr key={p}>
                  {(["name", "time", "location"] as const).map((f) => (
                    <td key={f} className="border-2 border-[var(--ink)] p-0">
                      <input
                        value={pr[f]}
                        onChange={(e) => setPresenter(i, p, { [f]: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white text-right"
                      />
                    </td>
                  ))}
                  <td className="border-2 border-[var(--ink)] text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setStudio(i, {
                          presenters: st.presenters.filter((_, j) => j !== p),
                        })
                      }
                      className={delBtn}
                    >
                      הסרה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() =>
                setStudio(i, { presenters: [...st.presenters, { ...EMPTY_PRESENTER }] })
              }
              className={smallBtn}
            >
              + הוספת מגיש.ה
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`למחוק את הסטודיו "${st.name}"?`))
                  setStudios((s) => s.filter((_, j) => j !== i));
              }}
              className={delBtn}
            >
              מחיקת סטודיו
            </button>
          </div>
        </fieldset>
      ))}

      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() => setStudios((s) => [...s, { ...EMPTY_STUDIO }])}
          className={smallBtn}
        >
          + הוספת סטודיו
        </button>
        <Save />
      </div>
    </form>
  );
}

function DirectionsEditor({ initial }: { initial: DirectionSpot[] }) {
  const [spots, setSpots] = useState<DirectionSpot[]>(initial);
  const setSpot = (i: number, patch: Partial<DirectionSpot>) =>
    setSpots((s) => s.map((sp, j) => (j === i ? { ...sp, ...patch } : sp)));

  return (
    <form action={saveJsonSetting} className="flex flex-col gap-4">
      <input type="hidden" name="key" value="directions_json" />
      <input type="hidden" name="value" value={JSON.stringify(spots)} />

      {spots.map((sp, i) => (
        <fieldset key={i} className="border-2 border-[var(--ink)] p-4 bg-[var(--box)]/40 grid sm:grid-cols-2 gap-3">
          <label className={label}>
            שם המיקום (למשל: חניון, כניסה ראשית)
            <input
              value={sp.name}
              onChange={(e) => setSpot(i, { name: e.target.value })}
              className={input}
            />
          </label>
          <label className={label}>
            הערה (חופשי)
            <input
              value={sp.note}
              onChange={(e) => setSpot(i, { note: e.target.value })}
              className={input}
            />
          </label>
          <label className={label}>
            קישור Google Maps
            <input
              value={sp.maps_url}
              onChange={(e) => setSpot(i, { maps_url: e.target.value })}
              dir="ltr"
              className={input}
            />
          </label>
          <label className={label}>
            קישור Waze
            <input
              value={sp.waze_url}
              onChange={(e) => setSpot(i, { waze_url: e.target.value })}
              dir="ltr"
              className={input}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (confirm(`למחוק את "${sp.name}"?`))
                setSpots((s) => s.filter((_, j) => j !== i));
            }}
            className={`${delBtn} justify-self-start`}
          >
            מחיקה
          </button>
        </fieldset>
      ))}

      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() => setSpots((s) => [...s, { ...EMPTY_SPOT }])}
          className={smallBtn}
        >
          + הוספת מיקום
        </button>
        <Save />
      </div>
    </form>
  );
}

export default function AdminDashboard({
  settings,
  graduates,
}: {
  settings: Settings;
  graduates: Graduate[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("invite");
  const [boxColor, setBoxColor] = useState(settings.box_color);
  const [bgColor, setBgColor] = useState(settings.bg_color);
  const [edgeColor, setEdgeColor] = useState(settings.edge_color);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">ניהול התערוכה</h1>
        <form action={logoutAction}>
          <button className="text-sm underline underline-offset-4 opacity-70 cursor-pointer min-h-11">
            יציאה
          </button>
        </form>
      </header>

      <nav className="flex gap-2 mb-8 flex-wrap" role="tablist">
        {TABS.map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-5 py-2.5 border-2 border-[var(--ink)] font-bold cursor-pointer min-h-11 ${
              tab === id ? "bg-[var(--ink)] text-[var(--box)]" : "bg-[var(--box)]"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      {tab === "invite" && (
        <>
          <form action={saveSettings} className="flex flex-col gap-4">
            {INVITE_FIELDS.map(([key, name]) => (
              <label key={key} className={label}>
                {name}
                <input
                  name={key}
                  defaultValue={settings[key]}
                  dir={key.endsWith("_en") || key === "title_en_prefix" ? "ltr" : "rtl"}
                  className={input}
                />
              </label>
            ))}

            <h2 className="text-lg font-black mt-4">טיפוגרפיה — כותרות ראשיות</h2>
            {TYPO_ROWS.map(([k, name]) => (
              <fieldset
                key={k}
                className="border-2 border-[var(--ink)]/30 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <legend className="text-sm font-bold px-1">{name}</legend>
                <label className={label}>
                  גודל (px)
                  <input
                    name={`${k}_size`}
                    type="number"
                    min={14}
                    max={90}
                    defaultValue={settings[`${k}_size`]}
                    className={input}
                  />
                </label>
                <label className={label}>
                  משקל
                  <select
                    name={`${k}_weight`}
                    defaultValue={settings[`${k}_weight`]}
                    className={input}
                  >
                    <option value="400">רגיל (400)</option>
                    <option value="700">מודגש (700)</option>
                    <option value="900">שחור (900)</option>
                  </select>
                </label>
                <label className={label}>
                  מרווח שורות
                  <input
                    name={`${k}_lh`}
                    type="number"
                    step="0.05"
                    min={0.9}
                    max={2.5}
                    defaultValue={settings[`${k}_lh`]}
                    className={input}
                  />
                </label>
                <label className={label}>
                  סגנון
                  <select
                    name={`${k}_style`}
                    defaultValue={settings[`${k}_style`]}
                    className={input}
                  >
                    <option value="normal">רגיל</option>
                    <option value="outline">קו מתאר</option>
                    <option value="mixed">משולב (מילה ראשונה בקו מתאר)</option>
                  </select>
                </label>
              </fieldset>
            ))}

            <div>
              <Save />
            </div>
          </form>

          <h2 className="text-lg font-black mt-8 mb-3">לוגו</h2>
          <form
            action={saveLogo}
            className="border-2 border-dashed border-[var(--ink)] p-4 bg-white/40 flex flex-col gap-4"
          >
            <input type="hidden" name="current_logo" value={settings.logo_url} />
            {settings.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo_url}
                alt="הלוגו הנוכחי"
                className="h-12 w-auto self-start bg-white/60 p-1"
              />
            )}
            <label className={label}>
              קובץ לוגו (PNG/SVG שקוף מומלץ)
              <input
                name="logo"
                type="file"
                accept="image/*"
                className={`${input} bg-white/60`}
              />
            </label>
            <fieldset className="flex gap-6 items-center">
              <legend className="text-sm font-bold mb-1">מיקום</legend>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="logo_pos"
                  value="right"
                  defaultChecked={settings.logo_pos !== "left"}
                  className="w-5 h-5 accent-[var(--ink)]"
                />
                ימין למעלה
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="logo_pos"
                  value="left"
                  defaultChecked={settings.logo_pos === "left"}
                  className="w-5 h-5 accent-[var(--ink)]"
                />
                שמאל למעלה
              </label>
            </fieldset>
            <div className="flex gap-4 items-center">
              <Save label="שמירת לוגו" />
            </div>
          </form>
          {settings.logo_url && (
            <form action={removeLogo} className="mt-2">
              <button className="text-red-700 text-sm underline underline-offset-4 cursor-pointer min-h-11">
                הסרת הלוגו
              </button>
            </form>
          )}
        </>
      )}

      {tab === "grads" && (
        <div className="flex flex-col gap-6">
          <details className="border-2 border-dashed border-[var(--ink)] p-4 bg-white/40">
            <summary className="font-black cursor-pointer text-lg min-h-11 flex items-center">
              + הוספת בוגר.ת
            </summary>
            <form action={createGraduate} className="mt-4 flex flex-col gap-4">
              <GraduateFields />
              <div>
                <Save label="הוספה" />
              </div>
            </form>
          </details>

          {graduates.map((g) => (
            <details
              key={g.id}
              className="border-2 border-[var(--ink)] p-4 bg-[var(--box)]/40"
            >
              <summary className="font-bold cursor-pointer min-h-11 flex items-center gap-2">
                {g.name_he || "(ללא שם)"}
                <span className="opacity-60 text-sm font-normal">
                  {g.title} · {g.images.length} תמונות
                </span>
              </summary>
              <form action={updateGraduate} className="mt-4 flex flex-col gap-4">
                <input type="hidden" name="id" value={g.id} />
                <GraduateFields g={g} />
                <div className="flex gap-3">
                  <Save />
                </div>
              </form>
              <form
                action={deleteGraduate}
                onSubmit={(e) => {
                  if (!confirm(`למחוק את ${g.name_he}?`)) e.preventDefault();
                }}
                className="mt-3"
              >
                <input type="hidden" name="id" value={g.id} />
                <button className="text-red-700 text-sm underline underline-offset-4 cursor-pointer min-h-11">
                  מחיקת בוגר.ת
                </button>
              </form>
            </details>
          ))}
        </div>
      )}

      {tab === "schedule" && (
        <ScheduleEditor
          initial={parseJson<Studio[]>(settings.schedule_json, [])}
        />
      )}

      {tab === "directions" && (
        <DirectionsEditor
          initial={parseJson<DirectionSpot[]>(settings.directions_json, [])}
        />
      )}

      {tab === "theme" && (
        <form action={saveSettings} className="flex flex-col gap-6 max-w-sm">
          <label className={label}>
            צבע הקופסאות
            <span className="flex items-center gap-3">
              <input
                name="box_color"
                type="color"
                value={boxColor}
                onChange={(e) => {
                  setBoxColor(e.target.value);
                  document.body.style.setProperty("--box", e.target.value);
                }}
                className="w-16 h-12 border-2 border-[var(--ink)] cursor-pointer"
              />
              <code dir="ltr">{boxColor}</code>
            </span>
          </label>

          <label className={label}>
            צבע הרקע
            <span className="flex items-center gap-3">
              <input
                name="bg_color"
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  document.body.style.setProperty("--bg", e.target.value);
                }}
                className="w-16 h-12 border-2 border-[var(--ink)] cursor-pointer"
              />
              <code dir="ltr">{bgColor}</code>
            </span>
          </label>

          <label className={label}>
            צבע קו המתאר של הקופסאות (transparent = ללא קו)
            <span className="flex items-center gap-3">
              <input
                name="edge_color"
                type="text"
                dir="ltr"
                value={edgeColor}
                onChange={(e) => {
                  setEdgeColor(e.target.value);
                  document.body.style.setProperty("--edge", e.target.value);
                }}
                className={input}
              />
              <span
                aria-hidden="true"
                className="w-12 h-12 shrink-0 border-2 border-[var(--ink)]"
                style={{ background: edgeColor }}
              />
            </span>
          </label>

          {/* live preview */}
          <div className="scene3d py-6">
            <div
              className="cube tumble mx-auto"
              style={
                {
                  "--s": "90px",
                  "--dur": "5s",
                  "--rx0": "-20deg",
                  "--ry0": "30deg",
                  "--rz0": "0deg",
                  "--rx1": "15deg",
                  "--ry1": "-25deg",
                  "--rz1": "5deg",
                } as React.CSSProperties
              }
            >
              <div className="face f-front"><span className="glyph">T</span></div>
              <div className="face f-back"><span className="glyph">T</span></div>
              <div className="face f-right" />
              <div className="face f-left" />
              <div className="face f-top" />
              <div className="face f-bottom" />
            </div>
          </div>

          <div>
            <Save />
          </div>
        </form>
      )}
    </main>
  );
}
