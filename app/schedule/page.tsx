import Link from "next/link";
import { getSettings } from "@/lib/data";
import { parseJson, type Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "מועדי הגשות · Presentations" };

export default async function SchedulePage() {
  const settings = await getSettings();
  const studios = parseJson<Studio[]>(settings.schedule_json, []);
  const width = Number(settings.sched_width) || 768;
  const tableStyle = {
    "--sched-header-bg": settings.sched_header_bg,
    "--sched-header-fg": settings.sched_header_fg,
    "--sched-th-bg": settings.sched_th_bg,
    "--sched-row-bg": settings.sched_row_bg,
    "--sched-border": settings.sched_border,
  } as React.CSSProperties;

  return (
    <main
      className="flex-1 w-full mx-auto px-6 py-8"
      style={{ maxWidth: width, ...tableStyle }}
    >
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
            <header
              className="px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap"
              style={{
                background: "var(--sched-header-bg)",
                color: "var(--sched-header-fg)",
              }}
            >
              <h2 className="text-xl font-black">{st.name}</h2>
              <span className="font-bold">
                {st.date}
                {st.location && <span className="font-normal"> · {st.location}</span>}
              </span>
            </header>
            <table
              className="w-full border-collapse"
              style={{ background: "var(--sched-row-bg)" }}
            >
              <thead>
                <tr className="text-right text-sm">
                  <th
                    className="border-2 px-4 py-2.5"
                    style={{
                      borderColor: "var(--sched-border)",
                      background: "var(--sched-th-bg)",
                    }}
                  >
                    שם
                  </th>
                  <th
                    className="border-2 px-4 py-2.5 w-28"
                    style={{
                      borderColor: "var(--sched-border)",
                      background: "var(--sched-th-bg)",
                    }}
                  >
                    שעה
                  </th>
                </tr>
              </thead>
              <tbody>
                {st.presenters.map((p, j) => (
                  <tr key={j}>
                    <td
                      className="border-2 px-4 py-2.5 font-bold text-right"
                      style={{ borderColor: "var(--sched-border)" }}
                    >
                      {p.name}
                    </td>
                    <td
                      className="border-2 px-4 py-2.5 text-right"
                      dir="ltr"
                      style={{ borderColor: "var(--sched-border)" }}
                    >
                      {p.time}
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
