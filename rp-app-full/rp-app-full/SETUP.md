# RP Workout — Setup & Deployment Guide

Everything you need to get this running, including the fixes for issues hit during the first deploy.

## 1. Get the code into your repo

Unzip `rp-workout-app.zip`. Inside is a `rp-app-full` folder — its contents should be the **root** of your GitHub repo (not nested inside another folder). If your repo currently has the extra `rp-workout-app.zip` file committed alongside the extracted files, delete that zip from the repo — it shouldn't be tracked.

## 2. Supabase setup

### Create the project
Go to [supabase.com](https://supabase.com) → New project. Wait for it to finish provisioning (~2 min).

### Run the schema
1. Supabase dashboard → **SQL Editor** → New query
2. Paste the entire contents of `supabase-schema.sql`
3. Run it
4. Verify: go to **Table Editor** and confirm `mesocycles` and `workouts` both exist

If you get an error about `gen_random_uuid()`, run this first, then re-run the schema:
```sql
create extension if not exists pgcrypto;
```

### Run the second migration (for the new features)
This adds mesocycle plan storage, body measurements, and progress photo tracking.
1. SQL Editor → New query
2. Paste the entire contents of `supabase-schema-v2.sql`
3. Run it

### Set up progress photo storage (optional)
Only needed if you want to use the Progress Photos feature in the Measurements tab:
1. Supabase dashboard → **Storage** → Create a new bucket named exactly `progress-photos`
2. Leave it **private** (not public) — the app fetches photos via signed URLs, so it doesn't need to be public
3. No further policy setup needed — Row Level Security on the `progress_photos` table already scopes access per user

If you skip this, everything else works fine — only photo uploads will show an error until the bucket exists.

## 3b. AI Boost setup (optional — natural-language logging + coaching summaries)

This uses the Anthropic API directly (separate from anything in claude.ai) and costs a small amount per use — see the app's chat history with Claude for current pricing, or check https://docs.claude.com/en/docs/about-claude/pricing. Realistically pennies a month for personal use.

1. Get an API key from the Claude Console (console.anthropic.com) — you'll need billing enabled there
2. In Vercel → your project → Settings → Environment Variables, add:

| Key | Value | Type |
|---|---|---|
| `ANTHROPIC_API_KEY` | your key from the Console | **Secret** (not Config — this one is a real secret and must never reach the browser) |

Note this variable has **no `VITE_` prefix** — that's intentional. It's read only by the serverless functions in `api/`, never bundled into client-side code.

3. Redeploy
4. In the app, toggle **AI Boost** on (top of the Train tab) to reveal the natural-language logging box and the coaching summary button on the Progress tab

If you skip this entirely, the rest of the app works exactly the same — AI Boost defaults to off.

### Get your keys
Settings → API Keys → **Publishable and secret API keys** tab:
- Copy the **Publishable key** (`sb_publishable_...`) — this is what goes in your app, NOT the Secret key
- Or, if your project still shows the legacy tab: Settings → API → copy the **Project URL** and **anon public** key

### Get your Project URL
Settings → API (or the Data API integration page) → copy the **Project URL**. It looks like:
```
https://xxxxxxxxxxxxxxxxx.supabase.co
```
Use exactly this — **no trailing slash, no `/rest/v1/` on the end**. That path gets appended automatically by the Supabase client library.

### Configure the auth redirect (easy to miss)
By default, Supabase redirects magic-link sign-ins to `localhost:3000`, which will break in production.
1. Authentication → **URL Configuration**
2. Set **Site URL** to your live Vercel URL, e.g. `https://rp-app-full.vercel.app`
3. Add that same URL under **Redirect URLs**
4. Save

### Enable the 6-digit code in the login email (required — easy to miss)
The app's login screen asks people to type in a 6-digit code rather than
rely on clicking the emailed link. This matters most on phones: tapping
the link from Gmail (or any mail app) opens your **default browser**, not
an installed home-screen version of this app — and on iOS, that browser's
session is stored completely separately from the installed app's storage
anyway. So the link can "work" and the installed app still never sees you
as signed in. Typing the code into the still-open app sidesteps all of
that.

By default, Supabase's magic-link email template only includes the
clickable link — the code has to be added explicitly:
1. Authentication → **Email Templates** → **Magic Link**
2. In the template body, add `{{ .Token }}` somewhere visible (e.g. "Or
   enter this code: `{{ .Token }}`") — it can sit right alongside the
   existing `{{ .ConfirmationURL }}` link, no need to remove that
3. Save

Without this step, the email people receive won't contain a code at all,
and the "Verify code" step in the app will have nothing for them to type.

## 3. Exercise Library — no setup needed

The Exercise Library pulls directly from [`free-exercise-db`](https://github.com/yuhonas/free-exercise-db), a public-domain dataset hosted on GitHub. There's nothing to deploy — the app fetches it straight from GitHub's servers at runtime.

Trade-off: this dataset has **photos only, no video** (each exercise shows a short sequence of step images instead of a video clip). If you want video demonstrations later, that requires self-hosting a different data source — worth revisiting once the rest of the app is stable, since several of the free video-inclusive APIs have turned out to be unreliable or have moved to paid plans.

## 4. Environment variables (in Vercel)

Go to your `rp-app-full` project → Settings → Environment Variables. Add both, scoped to **Production and Preview**:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxxxxxx.supabase.co` (your real project URL, no path suffix) |
| `VITE_SUPABASE_ANON_KEY` | Your Publishable key (`sb_publishable_...`) or legacy anon key (`eyJhbGci...`) |

**Type**: choose **Config**, not Secret, for both — these values get bundled into the browser-side JavaScript anyway (that's what the `VITE_` prefix does), so there's no actual secrecy to protect, and Config lets you view the value again later if needed.

**If the dashboard's Save button won't respond:**
- Try a Private/Incognito window, or temporarily disable browser extensions (ad blockers/privacy shields can interfere)
- Or delete the variable entirely and re-add it fresh rather than editing in place

## 5. Deploy

Vercel doesn't pick up environment variable changes automatically — after adding or editing any of them, you must manually trigger a new deployment:

**Deployments tab → find the latest → ⋯ menu → Redeploy**

## 6. Test it

1. Open your live URL
2. Enter your email, click **Send code**
3. Check your email for the 6-digit code, type it into the app, click **Verify code**
4. You should land on your app, signed in

**If you see "Failed to fetch"** → `VITE_SUPABASE_URL` is wrong or still placeholder text
**If you see "Invalid API key"** → `VITE_SUPABASE_ANON_KEY` is wrong, or you're on a legacy key that's been disabled — use the Publishable key instead
**If it redirects to `localhost` and fails** → Site URL / Redirect URLs step (4 above) wasn't done
**If the email has no code to type in** → the email template step above wasn't done — `{{ .Token }}` needs to be added to the Magic Link template
**If it hangs on "Loading your training data..."** → check the browser console; a 404 on the Supabase requests means the schema (step 2) wasn't run or didn't complete
**If the Exercise Library shows an error** → this pulls from GitHub directly and needs no setup; a failure here usually means a temporary network hiccup — try again

## Local development

```bash
npm install
cp .env.example .env   # fill in your real values
npm run dev
```

## Project structure

```
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx                # App shell: auth, mesocycles, logging, history, tabs
│   ├── storage.js             # Supabase-backed persistence
│   ├── supabaseClient.js      # Supabase client init
│   ├── exerciseLibrary.js     # Fetches from your ExerciseDB deployment
│   └── ExerciseLibrary.jsx    # Search/browse UI with instructions + media
├── scripts/
│   └── scrub-videos.mjs       # Filters exercise dataset to entries with working video
├── supabase-schema.sql        # Run once in Supabase's SQL editor
├── .env.example
├── vercel.json
├── package.json
└── vite.config.js
```

## What's next

Once sign-in and logging are confirmed working, the next build phase is the **workout generator** — using the training-science sources you've gathered (Schoenfeld's hypertrophy research, RP's Scientific Principles framework) to auto-select exercises, sets, and progression rather than logging everything manually.
