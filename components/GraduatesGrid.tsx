"use client";

import { useState } from "react";
import Link from "next/link";
import type { Graduate } from "@/lib/types";

export default function GraduatesGrid({ graduates }: { graduates: Graduate[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? graduates.filter((g) =>
        [g.name_he, g.name_en, g.name_ar, g.title]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : graduates;

  return (
    <>
      <label className="block mb-6">
        <span className="sr-only">חיפוש לפי שם</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש · بحث · Search"
          className="w-full border-2 border-[var(--ink)] bg-white/60 px-4 py-3 text-base focus:outline-none focus:bg-white"
        />
      </label>

      {shown.length === 0 && (
        <p className="text-center opacity-60 py-12">
          {graduates.length === 0
            ? "הפרויקטים יעלו בקרוב · Projects coming soon"
            : "לא נמצאו תוצאות"}
        </p>
      )}

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {shown.map((g) => (
          <li key={g.id}>
            <Link
              href={`/graduates/${g.id}`}
              className="block bg-[var(--box)] border-2 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--ink)] transition-transform overflow-hidden"
            >
              <span className="block aspect-square bg-[color-mix(in_srgb,var(--box),black_12%)] overflow-hidden">
                {g.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.images[0]}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-4xl font-black opacity-20">
                    ?
                  </span>
                )}
              </span>
              <span className="block p-2 text-center">
                <span className="block font-bold leading-snug">{g.name_he}</span>
                {g.name_en && (
                  <span className="block text-sm leading-snug" dir="ltr" lang="en">
                    {g.name_en}
                  </span>
                )}
                {g.title && (
                  <span className="block text-xs opacity-70 mt-1 leading-snug">
                    {g.title}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
