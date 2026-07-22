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
  const storyParam = (await searchParams).story;
  // "1" = 9:16 story (1080x1920), "45" = 4:5 feed post (1080x1350)
  const story = storyParam === "45" ? "45" : storyParam === "1" ? "916" : false;
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
      <main className={`story-stage ${story === "45" ? "stage-45" : ""}`} dir="ltr">
        <div className="poster-stage go">
          <PosterScene settings={settings} picks={picks} story={story} />
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
            href="/schedule"
            className="block bg-[var(--box)] text-center py-7 px-4 text-xl font-black border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)] transition-transform"
          >
            מועדי הגשות · <span lang="ar">مواعيد العروض</span> · Presentations
          </Link>
          <Link
            href="/directions"
            className="block bg-[var(--box)] text-center py-7 px-4 text-xl font-black border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)] transition-transform"
          >
            דרכי הגעה וחניה · <span lang="ar">الوصول</span> · Getting Here
          </Link>
        </nav>
      </HomeStage>
    </main>
  );
}
