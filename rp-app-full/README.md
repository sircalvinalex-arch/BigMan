# RP Workout

A personal, RP-style (Renaissance Periodization) hypertrophy training app — mesocycle planning, workout logging, and an exercise library with instructional photos/videos. Cross-device sync via Supabase.

## Stack

- **React 18 + Vite** — app shell
- **Supabase** (Postgres + Auth) — cross-device data sync, magic-link email login
- **ExerciseDB** (self-hosted, open source) — exercise data: instructions, target muscles, images, GIFs, and video

## Features

- **Mesocycles** — named training blocks with a target week count
- **Workout logging** — exercise name, sets, reps, and RIR (reps in reserve), optionally tied to a mesocycle
- **History** — full log of past workouts, editable/deletable
- **Exercise Library** — search by name or browse by body part; each exercise shows step-by-step instructions plus a photo or video demonstration
- **Cross-device sync** — sign in with your email (magic link, no password) and your data follows you across phone, laptop, tablet

## Project structure

```
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx                # App shell: auth gate, mesocycles, logging, history, tabs
│   ├── storage.js             # Supabase-backed persistence (mesocycles, workouts, auth)
│   ├── supabaseClient.js      # Supabase client init
│   ├── exerciseLibrary.js     # Fetches exercise data from your ExerciseDB deployment
│   └── ExerciseLibrary.jsx    # Search/browse UI with instructions + media
├── scripts/
│   └── scrub-videos.mjs       # Filters the exercise dataset down to entries with a working video link
├── supabase-schema.sql        # Run once in Supabase's SQL editor to create tables + RLS policies
├── .env.example                # Template for required environment variables
├── vercel.json
├── package.json
└── vite.config.js
```

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd rp-workout
npm install
```

### 2. Set up Supabase (data + auth)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run everything in `supabase-schema.sql`. This creates the `mesocycles` and `workouts` tables with Row Level Security, so each user only ever sees their own data.
3. Go to Project Settings → API and copy your **Project URL** and **anon public key**.

### 3. Set up the Exercise Library (optional but recommended)

The exercise library needs its own data source — a self-hosted, open-source ExerciseDB instance:

1. Deploy [`cyberboyanmol/exercisedb-api`](https://github.com/cyberboyanmol/exercisedb-api) to Vercel (one-click deploy, MIT licensed, no server to manage).
2. Copy the resulting deployment URL.

If you skip this step, the app still works for logging and mesocycles — you just won't have the searchable exercise library with photos/videos.

### 4. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_EXERCISEDB_URL=https://your-exercisedb-deployment.vercel.app
```

### 5. Run it

```bash
npm run dev
```

Open the local URL Vite prints. Sign in with your email — you'll get a magic link, click it, and you're in.

### 6. Deploy

This repo is already set up for Vercel (`vercel.json` included):

```bash
vercel
```

Add the same three environment variables in your Vercel project settings.

## Data model

**Mesocycle**
```
{ id, name, weeks, focus[], start_date, created_at }
```

**Workout**
```
{
  id, date, mesocycle_id (nullable),
  exercises: [
    { name, sets: [{ weight, reps, rir }] }
  ]
}
```

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `node scripts/scrub-videos.mjs <exercisedb-url>` — checks every exercise in your ExerciseDB deployment for a working video link and writes `verified-exercises.json` / `verified-video-ids.json`. Useful since community-run exercise datasets sometimes have broken media links.

## Roadmap

- [ ] Workout generator — auto-select exercises and volume based on mesocycle progress and RP-style volume landmarks
- [ ] RIR-based autoregulation (adjust future sets based on how recent sets felt)
- [ ] Export/import for backing up data outside Supabase
- [ ] Filter the Exercise Library to only show entries with verified working video (using `scrub-videos.mjs` output)

## License

Personal project — add a license here if you plan to open source it.
