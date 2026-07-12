# אדריכלות במעבר · Architecture in Transition

Invitation + showcase site for the TAU Azrieli School of Architecture graduate
exhibition. Mobile-first, trilingual (עברית / English / عربي), themed as a
cardboard box that the visitor tears open.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Content comes from Supabase (project
`TAU-Architecture-2026`, ref `pvwunsndetcofttmkbpz`); credentials live in
`.env.local`. Without them the site still renders with the poster defaults.

## Admin

`/admin` — username `tau`, password `2026` (set in `.env.local` /
Vercel env vars). Tabs: invitation texts (3 languages), graduates
(details + image uploads + video links), faculty, theme colors.

## Deploy to Vercel

```bash
npx vercel login          # one-time
npx vercel --prod
```

Then in the Vercel dashboard → Project → Settings → Environment Variables,
add every variable from `.env.local` (SUPABASE_URL, SUPABASE_KEY, ADMIN_USER,
ADMIN_PASS, AUTH_SECRET) and redeploy.

## ⚠️ Fonts

`public/fonts/` currently holds **Narkiss Block TRIAL** files. Buy a web
license from [Fontef](https://fontef.com) before launch and replace the three
files (same names). Arabic uses Noto Kufi Arabic (free, via Google Fonts).

## Notes

- The Supabase anon key is used server-side only (never shipped to the
  browser) and doubles as the write credential; RLS is permissive for it.
  If the key ever leaks, rotate it in Supabase → Settings → API.
- Intro animation is skipped automatically for returning visitors
  (localStorage) and for `prefers-reduced-motion` users.
