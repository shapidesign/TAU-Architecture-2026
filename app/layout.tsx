import type { Metadata, Viewport } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { getSettings } from "@/lib/data";
import "./globals.css";

const arabic = Noto_Kufi_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "אדריכלות במעבר · Architecture in Transition",
  description:
    "תערוכת בוגרים.ות — הפקולטה לאדריכלות ע״ש דוד עזריאלי, אוניברסיטת תל אביב · Graduate Exhibition · معرض الخريجين",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${arabic.variable} h-full antialiased`}
    >
      <body
        className="min-h-dvh flex flex-col"
        style={
          {
            "--box": settings.box_color,
            "--bg": settings.bg_color,
            "--edge": settings.edge_color,
          } as React.CSSProperties
        }
      >
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="py-6 text-center text-sm opacity-70">
          <a
            href="https://www.alefsofit.com/"
            target="_blank"
            rel="noopener"
            className="underline underline-offset-4 hover:opacity-100"
          >
            עיצוב ופיתוח: יהונתן שפירא
          </a>
        </footer>
      </body>
    </html>
  );
}
