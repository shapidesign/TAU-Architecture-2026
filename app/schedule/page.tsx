import Link from "next/link";
import { getSettings } from "@/lib/data";
import { parseJson, type Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "מועדי הגשות · Presentations" };

export default async function SchedulePage() {
  const settings = await getSettings();
  const studios = parseJson<Studio[]>(settings.schedule_json, []);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
        → חזרה · Back
      </Link>
      <h1 className="text-3xl font-black my-6 text-center">
        מועדי הגשות · <span lang="ar">مواعيد العروض</span> · Presentations
      </h1>

      {studios.length === 0 && (
        <p className="text-center opacity-60 py-12">הלו״ז יעלה בקרוב · Coming soon</p>
      )}

      <div className="flex flex-col gap-10">
        {studios.map((st, i) => (
          <section key={i}>
            <header className="bg-[var(--ink)] text-[var(--box)] px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-black">{st.name}</h2>
              <span className="font-bold">
                {st.date}
                {st.location && <span className="font-normal"> · {st.location}</span>}
              </span>
            </header>
            <table className="w-full border-collapse bg-[var(--box)]/40">
              <thead>
                <tr className="text-right text-sm">
                  <th className="border-2 border-[var(--ink)] px-4 py-2.5 bg-[var(--box)]">
                    שם
                  </th>
                  <th className="border-2 border-[var(--ink)] px-4 py-2.5 bg-[var(--box)] w-28">
                    שעה
                  </th>
                  <th className="border-2 border-[var(--ink)] px-4 py-2.5 bg-[var(--box)]">
                    מיקום
                  </th>
                </tr>
              </thead>
              <tbody>
                {st.presenters.map((p, j) => (
                  <tr key={j}>
                    <td className="border-2 border-[var(--ink)] px-4 py-2.5 font-bold">
                      {p.name}
                    </td>
                    <td className="border-2 border-[var(--ink)] px-4 py-2.5" dir="ltr">
                      {p.time}
                    </td>
                    <td className="border-2 border-[var(--ink)] px-4 py-2.5">
                      {p.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </main>
  );
}
