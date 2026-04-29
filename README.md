# Stash

Your private personal storage and organization system. A mobile-first PWA you install on your iPhone Home Screen — notes, photos, files, and links organized into folders, with search, pins, and favorites. Built with Next.js 16, TypeScript, Tailwind v4, and Supabase. Designed to deploy free on Vercel.

> Single-user by design. Authorization is a passcode you set in `APP_PASSCODE`. No signup, no email, no third party login.

---

## What you need

- A free **Supabase** project — [https://supabase.com](https://supabase.com)
- A free **Vercel** account — [https://vercel.com](https://vercel.com) (sign in with GitHub)
- A **GitHub** account, and this repo pushed to it
- Node.js 20+ on your machine (for local dev)

---

## 5-minute setup

### 1. Create the Supabase project

1. [https://supabase.com](https://supabase.com) -> New project. Pick any region close to you. Save the database password somewhere safe.
2. Go to **Project Settings -> API** and copy:
  - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
  - `anon` `public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` secret key -> `SUPABASE_SERVICE_ROLE_KEY` (treat like a password)

### 2. Create the database schema

1. In Supabase, open **SQL Editor -> + New query**.
2. Paste the entire contents of `[supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)` and click **Run**. You should see "Success".

### 3. Create the Storage bucket

1. In Supabase, go to **Storage -> New bucket**.
2. Name: `items`. **Public:** off (private). Click **Create**.
3. (Optional but recommended) **Settings** of the bucket: "Allowed MIME types" can stay empty; max file size 50 MB is plenty for a free tier.

### 4. Configure environment locally

1. Copy `.env.local.example` to `.env.local`.
2. Fill in the three Supabase values from step 1.
3. Generate `SESSION_SECRET`: run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in PowerShell and paste the output.
4. Set `APP_PASSCODE` to a long passphrase only you know.

### 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and unlock with your passcode.

### 6. Deploy to Vercel

1. Push the repo to GitHub.
2. [https://vercel.com/new](https://vercel.com/new) -> import the repo.
3. In **Project -> Settings -> Environment Variables**, add **all** values from `.env.local` (including `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSCODE`, `SESSION_SECRET`). Apply to **Production, Preview, Development**.
4. Hit **Deploy**. Wait ~60 seconds.

### 7. Install on your iPhone

1. Open the deployed URL in **Safari** on your iPhone (it must be Safari, not Chrome).
2. Tap the **Share** icon -> **Add to Home Screen** -> **Add**.
3. Open from the Home Screen icon. It runs in standalone mode (no Safari chrome). Unlock with your passcode.

You're done.

---

## Free tier limits, in plain English

- **Supabase free:** 500 MB Postgres, 1 GB Storage, 5 GB egress/month. Project pauses after **7 days of no activity** — visiting the URL unpauses it (~30 s cold start).
- **Vercel Hobby:** 100 GB bandwidth/month, unlimited deploys, custom domain. Personal use only (you're fine).
- Practical ceiling: a few thousand notes + about 1 GB of images and files. Way more than you need to dogfood.

If you outgrow Supabase Storage, swap to Cloudflare R2 (10 GB free, zero egress) by replacing the four functions in `[src/lib/storage.ts](src/lib/storage.ts)`. The rest of the app doesn't care.

---

## What v1 includes

- Passcode unlock, signed cookie session, rate-limited login.
- Folders with custom icon and color; pin/rename/delete.
- Items: **note**, **photo** (auto-compressed before upload), **file**, **link** (auto-fetches title).
- Pin items, favorite items, soft-delete to Trash, restore, purge.
- Postgres full-text search across titles, bodies, URLs, mime types.
- PWA: manifest, generated icons, splash, service worker. Installable on iPhone.
- Mobile shell: bottom nav, bottom-sheet composer, safe-area aware, dark mode follows system.

## What's not in v1 (planned for v2)

- Tags
- Reminders + Web Push notifications (iOS 16.4+ only, after Add to Home Screen)
- Markdown editor with preview
- Drag-to-reorder folders, nested folder UI
- Export (zip)
- Offline read cache

---

## iOS PWA gotchas (worth knowing)

- iOS Safari can **evict** offline cache after ~7 weeks of no use or under disk pressure. This app is cloud-first, so your data is safe in Supabase regardless.
- iOS does **not** support Web Share Target API yet, so you can't add a "share to Stash" sheet entry. Workaround: open Stash, tap +, paste link.
- Push notifications require iOS 16.4+ **and** the app to be added to Home Screen first. Reminders are a v2 feature.
- External links in standalone mode can break out of the PWA. Long-press to share/copy when needed.

---

## Project layout

```
src/
  app/
    (app)/                authenticated routes (home, folders, items, search, favorites, trash, settings)
    api/file/[id]/        signed-URL redirect for stored files
    login/                passcode page + server action
    layout.tsx            root layout
    manifest.ts           PWA manifest
    icon.tsx              generated app icon
    apple-icon.tsx        generated apple-touch icon
  components/             UI primitives + shared components
  lib/                    env, session, supabase, storage, data, utils, types
  middleware.ts           passcode-session route guard
public/
  sw.js                   service worker
supabase/migrations/      database schema (run in Supabase SQL editor)
```

---

## Privacy

- Single-user. No analytics. No third parties beyond Supabase + Vercel.
- All file URLs are time-limited signed URLs (default 1 hour); the bucket is private.
- The passcode is the only authorization layer. Use a long passphrase. Cookies are HttpOnly + SameSite=Lax + Secure in production.

