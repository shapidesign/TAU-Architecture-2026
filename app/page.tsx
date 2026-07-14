import Link from "next/link";
import HomeStage from "@/components/HomeStage";
import PosterScene from "@/components/PosterScene";
import type { GraduatePick } from "@/components/LetterCube";
import { getGraduates, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ story?: string }>;
}) {
  const story = (await searchParams).story === "1";
  const [settings, graduates] = await Promise.all([getSettings(), getGraduates()]);

  // pool of works — each cube picks a random one every time it opens;
  // prefer graduates that already have images so reveals stay visual
  const all: GraduatePick[] = graduates.map((g) => ({
    id: g.id,
    name_he: g.name_he,
    cover: g.images[0] ?? null,
  }));
  const withCovers = all.filter((p) => p.cover);
  const picks = withCovers.length > 0 ? withCovers : all;

  if (story) {
    return (
      <main className="story-stage" dir="ltr">
        <div className="poster-stage go">
          <PosterScene settings={settings} picks={picks} story />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <HomeStage>
        <PosterScene settings={settings} picks={picks} />

        {/* main navigation */}
        <nav className="w-full max-w-md mx-auto px-6 py-10 flex flex-col gap-6">
          <Link
            href="/graduates"
            className="block bg-[var(--box)] text-center py-7 px-4 text-xl font-black border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)] transition-transform"
          >
            בוגרים.ות · <span lang="ar">الخريجون</span> · Graduates
          </Link>
          <Link
            href="/faculty"
            className="block bg-[var(--box)] text-center py-7 px-4 text-xl font-black border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)] transition-transform"
          >
            סגל אקדמי · <span lang="ar">الطاقم الأكاديمي</span> · Academic Faculty
          </Link>
        </nav>
      </HomeStage>
    </main>
  );
}
