import Link from "next/link";
import GraduatesGrid from "@/components/GraduatesGrid";
import { getGraduates } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "בוגרים.ות · Graduates · الخريجون" };

export default async function GraduatesPage() {
  const graduates = await getGraduates();
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm underline underline-offset-4 opacity-70">
        → חזרה · Back
      </Link>
      <h1 className="text-3xl font-black my-6 text-center">
        בוגרים.ות · <span lang="ar">الخريجون</span> · Graduates
      </h1>
      <GraduatesGrid graduates={graduates} />
    </main>
  );
}
