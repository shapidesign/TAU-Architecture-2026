import Link from "next/link";
import { getFaculty } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "סגל אקדמי · Academic Faculty" };

export default async function FacultyPage() {
  const faculty = await getFaculty();
  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
        → חזרה · Back
      </Link>
      <h1 className="text-3xl font-black my-6 text-center">
        סגל אקדמי · <span lang="ar">الطاقم الأكاديمي</span> · Academic Faculty
      </h1>

      {faculty.length === 0 && (
        <p className="text-center opacity-60 py-12">הרשימה תעלה בקרוב · Coming soon</p>
      )}

      <ul className="flex flex-col gap-3">
        {faculty.map((f) => (
          <li
            key={f.id}
            className="bg-[var(--box)] border-2 border-[var(--ink)] px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap"
          >
            <span className="font-bold text-lg">
              {f.name_he}
              {f.name_en && (
                <span className="font-normal text-base opacity-80" dir="ltr" lang="en">
                  {" "}
                  · {f.name_en}
                </span>
              )}
            </span>
            {f.role && <span className="text-sm opacity-70">{f.role}</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
