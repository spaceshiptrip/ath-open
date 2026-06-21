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
| `24a8409` | Jun 21, 2026 | Expanded Section 6 with full 8-step Google Sheets connection guide |
| `6acd741` | Jun 21, 2026 | Added Section 10: tournament format analysis, timeline, rally scoring, open questions |

---

## 9. TODO / Work Remaining

### Must-have before tournament day
- [x] **Connect Google Sheets** — full 8-step connection guide in Section 6 above
- [ ] **Add real players** — replace mock roster with actual registered players (either via registration form or manually in the Players sheet)
- [ ] **Finalize tournament format** — scoring (rally vs traditional), round count, court count (see Section 10 open questions)
- [ ] **Set match pairings** — fill in player IDs in Schedule sheet columns E–H before each round; consider auto-generating the full pairing schedule once format is decided
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

## 10. Tournament Format Analysis — 12 Players Per Team

> **Status as of Jun 21, 2026 — decisions pending.** See open questions at the bottom of this section before updating the app or spreadsheet.

### Roster size confirmed
- **24 players total**: 12 per team
- **Each team**: 9 men + 3 women
- **Game types**: Men's Doubles and Mixed Doubles (no Women's Doubles planned)
- **Team A captain**: Suzan (woman) · **Team B captain**: Cora (woman)

---

### Does the current 8-round format scale to 24 players?

**Current format:** 8 rounds × 2 courts = **16 matches total**  
Each match uses 2 players per side → **32 player-game slots per team per tournament**

```
32 slots ÷ 12 players = 2.67 games per person average
```

#### Men's games breakdown (16 total matches, assume 5 are Mixed Doubles)

| Stat | Value |
|------|-------|
| Men's Doubles matches | 11 |
| Mixed Doubles matches | 5 |
| Men's slots (11 × 2 + 5 × 1) | 27 |
| Men per team | 9 |
| Average games per man | **3.0** ✅ |

Men just barely fit — everyone averages exactly 3 games. But this requires perfectly balanced scheduling with no one sitting out twice in a row, which is hard to achieve manually with 9 people and only 4 playing per round.

#### Women's games breakdown (5 Mixed Doubles matches)

| Stat | Value |
|------|-------|
| Mixed Doubles matches | 5 |
| Women's slots available | 5 |
| Women per team | 3 |
| Average games per woman | **1.67** ⚠️ |

Women are underserved — some get only 1 game. To give all 3 women **2 games each** you need **6 Mixed Doubles slots**, which means either:
- Replacing 1 Men's Doubles match with a Mixed Doubles match (reducing men's total slightly), or
- Adding more rounds (see options below)

---

### Does a bracket/elimination format work here?

**No — and here's why:**

A bracket (single or double elimination) assumes:
- Individual or pair matchups where losers get eliminated
- Only the winner advances to the next round
- Half the field stops playing after Round 1

This tournament is **Team vs Team round robin** — the *team's cumulative wins* determine the winner, not any individual pair. Every player needs to keep competing throughout the tournament regardless of their game result. A bracket would mean half the players sit out for the rest of the day after losing Round 1, which defeats the purpose of a social tournament.

**What "bracket seeding" actually means here:** how you *order and assign pairs* within a round (skill-based seeding so strong pairs don't always face each other). That's a pairing/scheduling problem, not a bracket format. The round robin structure stays.

---

### Timeline reality check — traditional scoring

Traditional scoring: only the **serving team** scores a point.

```
Average game to 11 (traditional):   15–20 minutes
Court changeover between rounds:      3–5 minutes
Per round (wait for both courts):    ~20–25 minutes worst case

8 rounds × 22 min = 176 minutes = ~2 hr 56 min
+ warm-up buffer (8:00–8:30)     = 3 hr 26 min total
Hard cutoff: Noon (3.5 hrs from 8:30 start)
Buffer remaining: ~4 minutes ← effectively zero
```

**Risk:** One game that runs to 13-11 or 15-13 (common in competitive play) costs 5–8 extra minutes. With 8 rounds that risk compounds. The schedule likely **runs over** with 24 players and traditional scoring.

Additional time pressure with 24 players vs the original smaller group:
- More players to rotate in/out between rounds
- Captains need to assign pairs and confirm rosters each round
- Score reporting takes longer with more matches to track

---

### Rally scoring — what it is and whether it helps

**Rally scoring:** both teams can score a point on *every* rally, regardless of who served. Standard in most pickleball tournaments and leagues.

```
Average game to 15 (rally scoring):   10–13 minutes
Average game to 21 (rally scoring):   16–22 minutes
Average game to 11 (rally scoring):    7–10 minutes
```

**Why rally scoring to 15 is the tournament standard:**  
- Faster and more predictable than traditional scoring to 11
- Games rarely blow out (a team down 14-5 knows it's over; in traditional scoring they don't)
- Easier to track score (no side-out confusion)
- Widely understood — most recreational players have played it

#### Timeline with rally scoring to 15

```
Average game to 15 (rally):           11 minutes
Court changeover:                       3 minutes
Per round (both courts):              ~14 minutes

8 rounds  × 14 min = 112 min = 1 hr 52 min → done by ~10:22 AM
10 rounds × 14 min = 140 min = 2 hr 20 min → done by ~10:50 AM
12 rounds × 14 min = 168 min = 2 hr 48 min → done by ~11:18 AM
```

Rally scoring to 15 gives significant breathing room at any round count.

---

### Format comparison table

> **Note:** table below uses rough averages. See the "Match count math" section further below for the precise per-player game counts based on confirmed 2-court, 9M+3W structure.

| Format | Rounds | Matches | Games/man | Games/woman | Est. finish | Clean math? | Risk |
|--------|--------|---------|-----------|-------------|-------------|-------------|------|
| Trad 11 pts | 8 | 16 | 3 exact ✅ | 1–2 ⚠️ | ~11:56 AM | Partially | 🔴 No buffer |
| Trad 11 pts | 9 | 18 | 3 exact ✅ | 3 exact ✅ | Noon+ | ✅ Perfect | 🔴 Over |
| Rally to 15 | 8 | 16 | 3 exact ✅ | 1–2 ⚠️ | ~10:22 AM | Partially | 🟢 98 min |
| **Rally to 15** | **9** | **18** | **3 exact ✅** | **3 exact ✅** | **~10:36 AM** | **✅ Perfect** | **🟢 84 min** |
| Rally to 15 | 10 | 20 | fractional ⚠️ | fractional ⚠️ | ~10:50 AM | ❌ Uneven | 🟡 70 min |
| Rally to 21 | 8 | 16 | 3 exact ✅ | 1–2 ⚠️ | ~11:26 AM | Partially | 🟡 34 min |
| Rally to 21 | 9 | 18 | 3 exact ✅ | 3 exact ✅ | ~11:36 AM | ✅ Perfect | 🟡 24 min |

**Sweet spot: 9 rounds, rally scoring to 15 — everyone plays exactly 3 games, done by 10:36 AM.**

---

### Match count math — 2 courts confirmed, 9M + 3W per team

> **Courts confirmed: 2 (North and South).** This section works out exactly how many Men's Doubles and Mixed Doubles matches are possible and what each option means for every player.

#### The core equation

Each round: 2 courts run simultaneously, so:

```
Total matches  = Rounds × 2
Men's slots    = (Men's Doubles matches × 2) + (Mixed Doubles matches × 1)
Women's slots  = Mixed Doubles matches × 1
```

With **9 men × 3 games each = 27 men's slots needed**:

```
2M + X = 27    (M = men's doubles matches, X = mixed doubles matches)
```

For M to be a whole number, **X must be odd.**  
For 3 women to each play an equal integer number of games, **X must be divisible by 3.**  
Both constraints together: **X must be an odd multiple of 3 → X = 3, 9, 15 …**

#### The only mathematically clean options

| Rounds | Total matches | Men's Doubles (M) | Mixed Doubles (X) | Games/man | Games/woman | Round structure |
|--------|--------------|-------------------|-------------------|-----------|-------------|-----------------|
| **8**  | 16 | **11** | **5** | 3 each ✅ | 1–2 each ⚠️ uneven | Some rounds both men's, some mixed |
| **9**  | 18 | **9**  | **9** | 3 each ✅ | 3 each ✅ | **Every round: 1 men's court + 1 mixed court** |
| 10     | 20 | **7**  | **13**| 3 each ✅ | 4+ each ❌ | Too much mixed |

Any other round count (7, 11, 12 …) produces fractional matches or unequal women's games.

#### What each option looks like on the day

**8 rounds — 11 Men's Doubles + 5 Mixed Doubles**
- Matches original tournament document structure
- Every man plays exactly 3 games ✅
- Two women play 2 games, one woman plays 1 game — uneven, matches old rule "captain plays 1"
- Round structure varies: some rounds both courts men's, others one or both courts mixed
- Risk: barely fits the noon cutoff with traditional scoring

**9 rounds — 9 Men's Doubles + 9 Mixed Doubles ← cleanest solution**
- Every man plays exactly 3 games ✅
- Every woman plays exactly 3 games ✅
- Round structure is perfectly uniform: **every single round has exactly 1 men's court + 1 mixed court running simultaneously** — captains always know what's happening each round
- Finishes comfortably before noon with rally scoring to 15 (~10:36 AM)
- This is the recommended format

#### Why other round counts don't work cleanly

Any round count where total matches × 2 doesn't equal a number satisfying both the "odd X" and "X divisible by 3" constraint produces either:
- Fractional matches (impossible)
- Some men playing more games than others (unfair)
- Some women playing more games than others (unfair)
- Way too many mixed doubles (e.g. 10 rounds → 13 mixed out of 20 = 65% mixed)

#### Sit-out pattern per round

With 2 courts and 2 players per side per match:
- **Men's court:** 2 Team A men + 2 Team B men = 4 men per team playing
- **Mixed court:** 1 Team A man + 1 Team A woman + 1 Team B man + 1 Team B woman = 1 man + 1 woman per team playing
- **Per round per team:** 5 men play (4 men's + 1 mixed), 1 woman plays, **4 men sit out**

With 9 men and 4 sitting out each round, in 9 rounds:
- Each man plays 5 rounds and sits out 4 rounds (9 rounds × 5/9 playing rate = 5 games)... 

Wait, that's 5 games not 3. Let me re-examine.

Actually each man plays in **some** of those 5 slots. Over 9 rounds × 5 men's slots per round = 45 men's slots total per team. 45/9 men = 5 slots per man. But each match a man plays in counts as 1 game for him, so 5 games per man? That contradicts the 3 games target.

Correction: the 27-slot constraint means each of 9 men fills exactly 3 of the 27 slots — so **9 men × 3 games = 27 slots used, and in 9 rounds × 3 men-slots-per-round = 27** ✅ (5 men's court slots + ... wait)

Re-check per round: men's court uses 2 men per team, mixed court uses 1 man per team → **3 men per team play each round**, 6 sit out.

```
9 rounds × 3 men playing per round = 27 men-game slots ÷ 9 men = 3 games each ✅
9 rounds × 1 woman playing per round = 9 women-game slots ÷ 3 women = 3 games each ✅
Per round: 3 men play, 6 men sit out, 1 woman plays, 2 women sit out
```

This is the correct sit-out math. 6 of 9 men sit out each round — scheduling must ensure no man sits out more than 6 consecutive rounds, and the algorithm distributes sit-outs fairly.

---

### Player pairing / seeding algorithm

With 9 men needing 3 games each with **different partners every time**, manual scheduling is error-prone. A proper algorithm needs to satisfy:

1. **Uniqueness constraint** — no two men from the same team are ever paired together more than once across all 9 rounds
2. **Opponent variety** — ideally no pair from Team A faces the same opposing pair from Team B more than once
3. **Women distribution** — 3 women take turns across 9 mixed rounds, each playing 3 games with different male partners
4. **Sit-out fairness** — 6 of 9 men sit out each round; the algorithm must rotate sit-outs so no one sits out more than 2 rounds in a row

With 9 men: C(9,2) = **36 possible unique pairs** — far more than the 9 pairings each man needs, so the uniqueness constraint is easily satisfiable.

The algorithm is a **round-robin doubles scheduling problem** (also called "social doubles" or "American doubles" rotation). It can be auto-generated once the final scoring format is confirmed.

**Plan:** generate the full 9-round pairing schedule as a pre-filled spreadsheet tab so captains just read off assignments rather than improvise on the day.

---

### ⚠️ Open questions — decisions needed before updating the app

Courts are now confirmed as **2 (North + South)**. Remaining decisions:

| # | Question | Options | Status | Impact |
|---|----------|---------|--------|--------|
| 1 | **Scoring format?** | Traditional 11 pts · **Rally to 15** · Rally to 21 | ⏳ Pending | Determines whether 9 rounds fits the noon cutoff |
| 2 | **Round count?** | 8 (uneven women) · **9 (everyone equal)** · other | ⏳ Pending | Changes number of rows in Schedule sheet and app |
| 3 | **Courts** | **2 confirmed (North + South)** | ✅ Resolved | — |
| 4 | **Mixed Doubles count?** | 5 (8-round option) · **9 (9-round option)** | ⏳ Follows from Q2 | Determined once round count is chosen |
| 5 | **Auto-generate pairings?** | Yes (algorithm output) · No (captains improvise) | ⏳ Pending | Whether a pairing schedule gets built |
| 6 | **Skill-based seeding?** | Yes (rank players, balance pairs) · No (pure random) | ⏳ Pending | If yes, skill level field added to registration form |

---

### Updated recommendation

> **9 rounds · rally scoring to 15 · 2 courts · 9 Mixed Doubles**

| What | Detail |
|------|--------|
| Every man | Plays exactly **3 games**, each with a different partner |
| Every woman | Plays exactly **3 games** (1 per 3 rounds) |
| Round structure | Every round: **1 men's court + 1 mixed court** — completely uniform, easy to manage |
| Estimated finish | 9 rounds × 14 min = 126 min → done by **~10:36 AM** · 84 min buffer before noon |
| App changes needed | Schedule sheet: 16 rows → 18 rows · Rules page: update scoring · Schedule page: show 9 rounds |

Previous recommendation was 10 rounds / 6 mixed doubles — updated to 9 rounds / 9 mixed doubles now that the court count (2) and player breakdown (9M + 3W) are confirmed, because 9 rounds is the only round count that gives everyone exactly equal games.

---

## 11. Known Issues / Notes

- The `node_modules/` deprecation warning about Node.js 20 in GitHub Actions is cosmetic — the build succeeds. Will auto-resolve when GitHub upgrades runner defaults.
- Source image files (`12511.jpg`, `athenaeum_header_logo.png`, `athenaeum_pickle_courts.png`, `IMG_2787.PNG`) are committed to the repo root. They are not served by the app — the app uses copies in `src/assets/`. These source files can be moved to a `/source-assets/` folder for cleanliness.
- The `.venv/` Python virtual environment is gitignored. It contains `python-docx` and `Pillow`, used during development to read the `.docx` file and compress images.
