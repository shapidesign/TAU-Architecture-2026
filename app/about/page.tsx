import Link from "next/link";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "אדריכלות במעבר · Architecture in Transition",
};

export default async function AboutPage() {
  const s = await getSettings();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
        → חזרה · Back
      </Link>
      <h1 className="text-3xl font-black my-6 text-center">
        אדריכלות במעבר · <span lang="ar">عمارة قيد الانتقال</span> · Architecture
        in Transition
      </h1>

      {/* ponytail: centered column; justify + rtl = right-flush edges */}
      <div className="mx-auto max-w-prose flex flex-col gap-6 text-base leading-relaxed">
        {s.about_he && (
          <p className="whitespace-pre-line text-justify" dir="rtl">
            {s.about_he}
          </p>
        )}
        {s.about_ar && (
          <p lang="ar" className="whitespace-pre-line text-justify" dir="rtl">
            {s.about_ar}
          </p>
        )}
        {s.about_en && (
          <p lang="en" className="whitespace-pre-line text-justify" dir="ltr">
            {s.about_en}
          </p>
        )}
      </div>
    </main>
  );
}
