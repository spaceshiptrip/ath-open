# ATH Open Pickleball Tournament — Requirements, Design & Work Log

**Last updated:** June 21, 2026  
**Live site:** https://spaceshiptrip.github.io/ath-open/  
**Repo:** https://github.com/spaceshiptrip/ath-open  
**Local dev:** `npm run dev` → http://localhost:5173/ath-open/

---

## 1. Tournament Rules (source: `2 Courts:2 Teams RR Blank Form.docx`)

| Rule | Detail |
|------|--------|
| Event | Team Round Robin @ The Athenaeum |
| Date | June 28th |
| Warm-up | 8:00 AM |
| Match time | 8:30 AM – Noon |
| Points per game | 11, win by 2 |
| At 11-all | Next point wins — Receivers' Choice |
| Server | Coin/paddle toss each game |
| Reporting | WIN ONLY reported to captain |
| Total games | 16 (8 rounds × 2 courts) |
| Games breakdown | 27 Men's Doubles + 5 Mixed Doubles |
| Men's play | Each man plays 3 games, different partner each time |
| Women's play | 2 women play 2 games; captain plays 1 game |
| Mix Doubles rounds | Rounds 3 (S+N), 4 (S only), 6 (S+N) = 5 Mix games |
| Team A captain | Suzan |
| Team B captain | Cora |
| Courts | S = South Court, N = North Court |
| Special note | Mix Dub game 4 and 6 (from email — `IMG_2787.PNG`) |

---

## 2. Architecture

```
┌──────────────────────────────┐     HTTPS GET      ┌─────────────────────────┐
│  React SPA — GitHub Pages    │ ────────────────►  │  Google Apps Script     │
│  Vite + Tailwind             │                    │  Web App  (code.gs)     │
│  spaceshiptrip.github.io/    │ ◄────────────────  │  deployed from Sheet    │
│  ath-open/                   │     JSON response  └──────────┬──────────────┘
└──────────────────────────────┘                               │
         ▲                                                     ▼
         │  npm run build → dist/                  ┌─────────────────────────┐
         │  GitHub Actions deploys dist/           │  Google Spreadsheet     │
         │                                         │  tabs: Players          │
    git push → CI/CD                               │        Schedule         │
                                                   └─────────────────────────┘
```

### Key design decisions

| Decision | Reason |
|----------|--------|
| `HashRouter` | GitHub Pages returns 404 on direct sub-path loads; hash routing avoids this |
| All API calls are HTTP GET | Google Apps Script Web Apps handle CORS automatically for GET; POST requires CORS preflight which Apps Script doesn't support |
| `VITE_SHEETS_API_URL` env var | When unset, app falls back to in-app mock data — full local dev with no backend needed |
| Images imported as ES modules | Vite applies content hashing and correct base-path resolution automatically |
| Courts photo compressed PNG→JPG | Original was 4.3 MB; Pillow resized to 1400px and JPEG-compressed to 124 KB (97% reduction) |
| `vite.config.js` base = `/ath-open/` | Matches the GitHub Pages sub-path for the `spaceshiptrip/ath-open` repo |

---

## 3. What Has Been Built (completed work)

### 3.1 Project scaffolding
- Vite 5 + React 18 + Tailwind 3 project initialized from scratch
- `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` configured
- Custom Tailwind color tokens: `pickle-*` (greens) and `ball` (yellow `#f5c518`)
- `.gitignore` excludes `node_modules/`, `dist/`, `.env`, `.venv/`
- `.env.example` documents the one required env var

### 3.2 Frontend — pages (6 routes)

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/#/` | `src/pages/Home.jsx` | ✅ Done | Courts hero photo, venue badge, live win totals, CTA buttons, teams + rules cards |
| `/#/register` | `src/pages/Register.jsx` | ✅ Done | Full form: name, team A/B toggle, gender toggle, phone, email, headshot URL |
| `/#/teams` | `src/pages/Teams.jsx` | ✅ Done | Two-column roster, Team B shows Dodgers logo in header |
| `/#/schedule` | `src/pages/Schedule.jsx` | ✅ Done | 8 rounds × 2 courts, Mix Doubles highlighted in gold |
| `/#/scores` | `src/pages/Scores.jsx` | ✅ Done | Live standings, toggle "Enter Scores" mode, A Wins / B Wins buttons per match |
| `/#/rules` | `src/pages/Rules.jsx` | ✅ Done | Full rules from tournament document, organized into sections |

### 3.3 Frontend — components (5)

| File | Purpose |
|------|---------|
| `src/components/Header.jsx` | Sticky dark-green nav; Athenaeum logo in white pill left; mobile hamburger; active-route highlight |
| `src/components/Footer.jsx` | Athenaeum logo + tournament name + date/time |
| `src/components/PlayerCard.jsx` | Player headshot (or initials avatar); team badge; captain badge; compact mode for inline lists |
| `src/components/MatchCard.jsx` | Shows round/court, Mix Doubles flag, pair names, result badge, A/B Win buttons (edit mode only), clear button |
| `src/components/Standings.jsx` | Team A vs Team B wins side-by-side; "LEADING" badge; games-completed counter |

### 3.4 Frontend — services & data

| File | Purpose |
|------|---------|
| `src/services/api.js` | All API calls; auto-falls back to mock data when `VITE_SHEETS_API_URL` not set |
| `src/hooks/useApi.js` | Generic React hook: `useApi('getPlayers')` returns `{ data, loading, error, reload }` |
| `src/data/mockData.js` | 16 sample players (8 per team, Suzan + Cora as captains) and all 16 match slots |
| `src/config.js` | Tournament constants (name, date, times, team captains); `RULES` array; env var export |

### 3.5 Backend — Google Apps Script (`backend/code.gs`)

Complete Apps Script ready to paste into the Google Apps Script editor. Implements:

| Function | Type | Description |
|----------|------|-------------|
| `doGet(e)` | Router | Routes all API requests by `e.parameter.action` |
| `getPlayers()` | GET | Returns all rows from Players sheet as JSON array |
| `registerPlayer(params)` | GET | Appends new player row with auto-generated ID + timestamp |
| `getMatches()` | GET | Returns all rows from Schedule sheet; coerces `isMix` to boolean |
| `updateScore(matchId, winner)` | GET | Finds match row by ID, writes winner value to column I |
| `getStandings()` | GET | Counts A/B wins from Schedule sheet; returns `{ A: n, B: n }` |
| `initSheets()` | Setup | Creates Players + Schedule tabs with headers + formatting; pre-populates all 16 match slots |
| `ensureSheet()` | Helper | Creates sheet if missing, adds bold green header row, freezes row 1 |
| `rowToObj()` | Helper | Converts a sheet row array + header array into a plain JS object |

### 3.6 Google Sheets structure

**Must be set up once before going live. Run `initSheets()` in Apps Script editor to auto-create.**

#### Players tab
| Col | Field | Example |
|-----|-------|---------|
| A | id | `p1750000000000` |
| B | firstName | `Suzan` |
| C | lastName | `King` |
| D | team | `A` |
| E | gender | `F` |
| F | isCaptain | `TRUE` |
| G | headshotUrl | `https://...` or blank |
| H | phone | `(555) 555-5555` |
| I | email | `suzan@example.com` |
| J | timestamp | `2026-06-28T08:00:00.000Z` |

#### Schedule tab
| Col | Field | Example |
|-----|-------|---------|
| A | id | `m1` |
| B | round | `1` |
| C | court | `S` |
| D | isMix | `FALSE` |
| E | teamAP1 | Player ID or blank |
| F | teamAP2 | Player ID or blank |
| G | teamBP1 | Player ID or blank |
| H | teamBP2 | Player ID or blank |
| I | winner | `A`, `B`, or blank |

#### Pre-populated match slots

| Match | Round | Court | Mix Doubles |
|-------|-------|-------|-------------|
| m1  | 1 | S | No  |
| m2  | 1 | N | No  |
| m3  | 2 | S | No  |
| m4  | 2 | N | No  |
| m5  | 3 | S | **Yes ★** |
| m6  | 3 | N | **Yes ★** |
| m7  | 4 | S | **Yes ★** |
| m8  | 4 | N | No  |
| m9  | 5 | S | No  |
| m10 | 5 | N | No  |
| m11 | 6 | S | **Yes ★** |
| m12 | 6 | N | **Yes ★** |
| m13 | 7 | S | No  |
| m14 | 7 | N | No  |
| m15 | 8 | S | No  |
| m16 | 8 | N | No  |

### 3.7 Branding & assets

| Asset | File | Status | Notes |
|-------|------|--------|-------|
| Athenaeum logo | `src/assets/athenaeum_header_logo.png` | ✅ In use | Burgundy script on white; shown in header pill and footer |
| Courts photo | `src/assets/athenaeum_pickle_courts.jpg` | ✅ In use | Hero background on Home page; compressed from 4.3 MB PNG → 124 KB JPG |
| Team B logo | `src/assets/team-b-logo.jpg` | ✅ In use | LA Dodgers logo; shown in Teams page Team B header + Home page team badge |
| Team A logo | — | ❌ Not yet | TBD — placeholder is a red circle with "A" |

### 3.8 CI/CD — GitHub Actions (`.github/workflows/deploy.yml`)

- **Trigger:** push to `main` branch, or manual "Run workflow"
- **Steps:** checkout → Node 20 → `npm ci` → `npm run build` → configure-pages → upload artifact → deploy-pages
- **Secret required:** `VITE_SHEETS_API_URL` (set in repo Settings → Secrets → Actions)
- **Live URL:** https://spaceshiptrip.github.io/ath-open/
- **Status:** ✅ Working — first successful deploy June 21, 2026 (initial run failed because GitHub Pages source wasn't set to "GitHub Actions" yet; fixed by changing Pages setting then re-running the workflow)

### 3.9 Theme & colors

| Token | Hex | Use |
|-------|-----|-----|
| `pickle-900` | `#0f2b1c` | Header, footer, hero overlay |
| `pickle-700` | `#1d4f35` | Active nav background |
| `pickle-600` | `#236040` | Primary buttons, links |
| `pickle-500` | `#2d7d4f` | Accent green |
| `ball` | `#f5c518` | Yellow accent — logo text, active nav, Mix Doubles badges |
| `red-600` | Tailwind | Team A color (all badges, avatars, headers, score buttons) |
| `blue-600/700` | Tailwind | Team B color (all badges, avatars, headers, score buttons) |
| `gray-50` | Tailwind | Page background |

**Note:** Team colors were originally A=blue/B=red, then swapped to A=red/B=blue on June 21 because Team B has the Dodgers (blue) logo.

---

## 4. File Structure (current)

```
ath-open/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions — build + deploy to Pages
├── backend/
│   └── code.gs                     # Google Apps Script — paste into Script Editor
├── public/
│   └── assets/                     # Static files (empty — images are in src/assets/)
├── src/
│   ├── assets/
│   │   ├── athenaeum_header_logo.png   # The Athenaeum burgundy script logo
│   │   ├── athenaeum_pickle_courts.jpg # Courts photo (compressed, used as hero bg)
│   │   └── team-b-logo.jpg             # LA Dodgers logo for Team B
│   ├── components/
│   │   ├── Header.jsx              # Sticky nav, Athenaeum logo pill, mobile hamburger
│   │   ├── Footer.jsx              # Logo + tournament details
│   │   ├── PlayerCard.jsx          # Headshot/avatar + badges; compact mode
│   │   ├── MatchCard.jsx           # Match display + A/B win entry buttons
│   │   └── Standings.jsx           # Side-by-side team wins + LEADING badge
│   ├── data/
│   │   └── mockData.js             # 16 sample players + 16 matches for local dev
│   ├── hooks/
│   │   └── useApi.js               # useApi('method') → { data, loading, error, reload }
│   ├── pages/
│   │   ├── Home.jsx                # Hero, stats, CTAs, teams card, rules preview
│   │   ├── Register.jsx            # Player sign-up form
│   │   ├── Teams.jsx               # Two-column rosters with logos
│   │   ├── Schedule.jsx            # Read-only 16-match schedule
│   │   ├── Scores.jsx              # Live standings + score entry toggle
│   │   └── Rules.jsx               # Full formatted rules
│   ├── services/
│   │   └── api.js                  # Sheets API calls + mock fallback
│   ├── App.jsx                     # HashRouter + layout shell
│   ├── config.js                   # TOURNAMENT constants, RULES array, env var
│   ├── index.css                   # Tailwind directives + .btn-primary, .card etc.
│   └── main.jsx                    # React 18 createRoot entry point
├── 12511.jpg                       # Source file for Team B logo (Dodgers)
├── athenaeum_header_logo.png       # Source file for Athenaeum logo
├── athenaeum_pickle_courts.png     # Source PNG for courts (uncompressed original)
├── IMG_2787.PNG                    # Screenshot of email with tournament special notes
├── 2 Courts:2 Teams RR Blank Form.docx  # Official tournament scoring document
├── .env.example                    # Template: VITE_SHEETS_API_URL=...
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 5. Local Development

### Requirements
- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/spaceshiptrip/ath-open.git
cd ath-open
npm install
npm run dev
# → http://localhost:5173/ath-open/
```

App runs fully on mock data. No Google Sheets or env vars needed.

### Connect to live Google Sheets

```bash
cp .env.example .env
# Edit .env:
# VITE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
npm run dev
```

---

## 6. Google Sheets Setup (one-time, before tournament)

> **How the roster works:** The registration form at `/#/register` writes directly to the **Players** sheet via the Apps Script API. The Teams page (`/#/teams`) reads from that same sheet. Players can self-register on the live site, or you can add rows manually in the spreadsheet — both work identically. Match pairings (who plays who) are the one thing not automated; those must be filled into the Schedule sheet manually before each round.

### Step 1 — Create the spreadsheet

1. Go to **https://sheets.google.com** → click **Blank spreadsheet**
2. Name it `ATH Open Pickleball`
3. Copy the **Spreadsheet ID** from the URL bar — it's the long string between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
   ```
   Save it — you'll use it in the next step.

### Step 2 — Add the Apps Script

1. In the spreadsheet: **Extensions → Apps Script**
2. Delete all the default content in `Code.gs`
3. Open `backend/code.gs` from your local repo and paste the entire contents
4. On line 1, paste your Spreadsheet ID:
   ```js
   const SS_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
5. **Save** (Cmd+S) — name the project `ATH Open API`

### Step 3 — Initialize the sheets (run once)

1. In the Apps Script editor, find the function dropdown (top center) and select **`initSheets`**
2. Click **Run**
3. A permissions popup will appear — click **Review permissions → Allow**
4. Back in your spreadsheet you'll now see two new tabs: **Players** and **Schedule**
5. The Schedule tab will have all 16 match slots pre-filled with the correct round/court/Mix Doubles data

### Step 4 — Deploy as Web App

1. Apps Script → **Deploy → New deployment**
2. Click the **gear icon** next to "Select type" → choose **Web app**
3. Set:
   - Description: `ATH Open API`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Copy the **Web App URL** — it ends in `/exec`. Save it — you'll need it in Steps 5 and 6.

### Step 5 — Add the secret to GitHub

1. Go to **https://github.com/spaceshiptrip/ath-open/settings/secrets/actions**
2. Click **New repository secret**
3. Name: `VITE_SHEETS_API_URL`
4. Value: the Web App URL from Step 4
5. Click **Add secret**

### Step 6 — Trigger a redeploy

1. Go to **https://github.com/spaceshiptrip/ath-open/actions**
2. Click the latest **Deploy to GitHub Pages** workflow → **Re-run all jobs**

The build will inject the real Sheets URL into the app. Once it goes green, the live site talks to your spreadsheet.

### Step 7 — Test the connection

1. Go to **https://spaceshiptrip.github.io/ath-open/#/register**
2. Register a test player
3. Open your Google Spreadsheet → **Players** tab — the row should appear immediately
4. Go to **`/#/teams`** — the player should show up in the roster
5. Go to **`/#/scores`**, click **Enter Scores**, toggle a win for any match
6. Check the **Schedule** tab in Sheets — the `winner` column (column I) for that match should update

### Step 8 — Add match pairings (before or on tournament day)

After players are registered, fill in the Schedule sheet so the app shows who is playing who:

1. Open the **Schedule** tab in the spreadsheet
2. For each of the 16 rows (m1–m16), fill in columns E–H:
   - **E** (`teamAP1`) — Team A Player 1's ID (e.g. `p1750000000001`)
   - **F** (`teamAP2`) — Team A Player 2's ID
   - **G** (`teamBP1`) — Team B Player 1's ID
   - **H** (`teamBP2`) — Team B Player 2's ID
3. Player IDs are in column A of the **Players** tab
4. You can fill these in round by round on the day, or all in advance

> **Tip:** The Schedule and Teams pages will show player names automatically once pairings are filled in — no code changes needed.

### Redeployment note

If you ever edit `code.gs` and need to redeploy, **always edit the existing deployment** rather than creating a new one:  
Apps Script → **Deploy → Manage deployments** → pencil icon → **Save**.  
Creating a new deployment generates a new URL, which means you'd have to update the GitHub secret and rebuild the frontend.

---

## 7. GitHub Pages Deployment

### One-time setup (already done)
1. GitHub repo → **Settings → Pages**
2. Source: **GitHub Actions** ← must be this, not "Deploy from a branch"
3. Save

### Add / update the Sheets secret
**Settings → Secrets and variables → Actions → New repository secret**
- Name: `VITE_SHEETS_API_URL`
- Value: Web App URL from Step 4 of the Sheets setup above

### Every deploy
Any push to `main` triggers the workflow automatically:
```bash
git add .
git commit -m "your message"
git push origin main
```

Monitor at: https://github.com/spaceshiptrip/ath-open/actions  
Live at: https://spaceshiptrip.github.io/ath-open/

### Manual re-run (no code change needed)
Go to **Actions** tab → click the latest workflow run → **Re-run all jobs**.

---

## 8. Commit History (what was done and when)

| Commit | Date | What changed |
|--------|------|-------------|
| `af49da4` | Jun 21, 2026 | Initial commit — all 28 files, full app scaffold, backend, CI/CD |
| `213e1d6` | Jun 21, 2026 | Added Athenaeum images: courts hero, logo in header/footer; compressed courts PNG→JPG (4.3MB→124KB) |
| `274b8e4` | Jun 21, 2026 | Swapped team colors: Team A → red, Team B → blue (to match Dodgers logo) |
| `2bf7fb3` | Jun 21, 2026 | Added Team B (Dodgers) logo to Teams page header and Home page team badge |
| `a13a385` | Jun 21, 2026 | Updated ATHOPEN.md with detailed work log and current state |

---

## 9. TODO / Work Remaining

### Must-have before tournament day
- [x] **Connect Google Sheets** — full 8-step connection guide in Section 6 above
- [ ] **Add real players** — replace mock roster with actual registered players (either via registration form or manually in the Players sheet)
- [ ] **Set match pairings** — fill in player IDs in Schedule sheet columns E–H before each round
- [ ] **Team A logo** — get a logo image for Team A and wire it in the same way as Team B (Teams page + Home badge)

### Nice-to-have
- [ ] **Captain PIN / score lock** — right now anyone can click "Enter Scores" and change results; a simple 4-digit PIN would restrict this to captains only
- [ ] **Auto-refresh scores** — poll the API every 30–60 seconds so live scores update without manual page reload
- [ ] **Player pairing UI** — let captains assign match pairings from within the app instead of editing the spreadsheet directly
- [ ] **Print scorecard** — a print-friendly `/#/print` page with the full schedule and blank score fields for courtside use
- [ ] **Headshot upload** — currently players paste a URL; could add Google Drive file picker or direct upload to a hosting bucket
- [ ] **Player stats** — track individual win/loss per player across all games they played
- [ ] **Mobile score entry** — make the Scores page faster to use on a phone courtside (larger tap targets, swipe to confirm)

---

## 10. Known Issues / Notes

- The `node_modules/` deprecation warning about Node.js 20 in GitHub Actions is cosmetic — the build succeeds. Will auto-resolve when GitHub upgrades runner defaults.
- Source image files (`12511.jpg`, `athenaeum_header_logo.png`, `athenaeum_pickle_courts.png`, `IMG_2787.PNG`) are committed to the repo root. They are not served by the app — the app uses copies in `src/assets/`. These source files can be moved to a `/source-assets/` folder for cleanliness.
- The `.venv/` Python virtual environment is gitignored. It contains `python-docx` and `Pillow`, used during development to read the `.docx` file and compress images.
