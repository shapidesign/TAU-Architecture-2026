import Link from "next/link";
import { notFound } from "next/navigation";
import { getGraduate } from "@/lib/data";

export const dynamic = "force-dynamic";

function videoEmbed(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default async function GraduatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const g = await getGraduate(id);
  if (!g) notFound();

  const embed = g.video_url ? videoEmbed(g.video_url) : null;

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/graduates"
        className="text-sm underline underline-offset-4 opacity-70"
      >
        → כל הבוגרים.ות · All graduates
      </Link>

      <header className="my-6 border-r-8 border-[var(--box)] pr-4">
        <h1 className="text-3xl font-black leading-tight">{g.name_he}</h1>
        {g.name_ar && (
          <p className="text-xl" lang="ar">
            {g.name_ar}
          </p>
        )}
        {g.name_en && (
          <p className="text-xl" dir="ltr" lang="en">
            {g.name_en}
          </p>
        )}
        {g.title && <p className="text-lg font-bold mt-3">{g.title}</p>}
      </header>

      {g.description && (
        <p className="whitespace-pre-line leading-relaxed mb-8">{g.description}</p>
      )}

      {g.video_url &&
        (embed ? (
          <iframe
            src={embed}
            className="w-full aspect-video border-2 border-[var(--ink)] mb-6"
            allow="fullscreen"
            title={`וידאו — ${g.name_he}`}
          />
        ) : (
          <video
            src={g.video_url}
            controls
            playsInline
            className="w-full border-2 border-[var(--ink)] mb-6"
          />
        ))}

      <div className="flex flex-col gap-6">
        {g.images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`עבודה של ${g.name_he}`}
            loading="lazy"
            className="w-full border-2 border-[var(--ink)] bg-white"
          />
        ))}
      </div>

      {g.link_url && (
        <a
          href={g.link_url}
          target="_blank"
          rel="noopener"
          className="inline-block mt-8 bg-[var(--box)] border-2 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] px-6 py-3 font-bold"
        >
          לינק חיצוני · External link ↗
        </a>
      )}
    </main>
  );
}
