import Link from "next/link";
import { getSettings } from "@/lib/data";
import { parseJson, type DirectionSpot } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "דרכי הגעה וחניה · Getting Here" };

const btn =
  "inline-block border-2 border-[var(--ink)] bg-white px-4 py-2 font-bold text-sm shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] transition-transform";

export default async function DirectionsPage() {
  const settings = await getSettings();
  const spots = parseJson<DirectionSpot[]>(settings.directions_json, []);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
        → חזרה · Back
      </Link>
      <h1 className="text-3xl font-black my-6 text-center">
        דרכי הגעה וחניה · <span lang="ar">الوصول</span> · Getting Here
      </h1>

      {spots.length === 0 && (
        <p className="text-center opacity-60 py-12">הפרטים יעלו בקרוב · Coming soon</p>
      )}

      <ul className="flex flex-col gap-4">
        {spots.map((sp, i) => (
          <li
            key={i}
            className="bg-[var(--box)] border-2 border-[var(--ink)] px-5 py-4 flex flex-col gap-2"
          >
            <span className="font-black text-lg">{sp.name}</span>
            {sp.note && <span className="text-sm opacity-80">{sp.note}</span>}
            <span className="flex gap-3 flex-wrap mt-1">
              {sp.maps_url && (
                <a href={sp.maps_url} target="_blank" rel="noopener noreferrer" className={btn}>
                  Google Maps ↗
                </a>
              )}
              {sp.waze_url && (
                <a href={sp.waze_url} target="_blank" rel="noopener noreferrer" className={btn}>
                  Waze ↗
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
