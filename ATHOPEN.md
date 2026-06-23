# ATH Open Pickleball Tournament — Requirements, Design & Work Log

**Last updated:** June 22, 2026  
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
| Total games | 18 (9 rounds × 2 courts) |
| Games breakdown | 11 Men's Doubles + 7 Mixed Doubles |
| Men's play | Each man plays 3 games (2 men play 4 — unavoidable), different partner each time |
| Women's play | Captain plays 1 game; each other woman plays 2 games (1+2+2+2 = 7 slots) |
| Mix Doubles rounds | R4 (both), R5 (South only), R7 (both), R9 (both) = 7 Mix games |
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
| `/#/teams` | `src/pages/Teams.jsx` | ✅ Done | Two-column roster, Blue Crew shows Dodgers logo in header |
| `/#/schedule` | `src/pages/Schedule.jsx` | ✅ Done | 9 rounds × 2 courts (18 matches), Mix Doubles highlighted in gold |
| `/#/scores` | `src/pages/Scores.jsx` | ✅ Done | Live standings, toggle "Enter Scores" mode, A Wins / B Wins buttons per match |
| `/#/rules` | `src/pages/Rules.jsx` | ✅ Done | Full rules from tournament document, organized into sections |

### 3.3 Frontend — components (5)

| File | Purpose |
|------|---------|
| `src/components/Header.jsx` | Sticky dark-green nav; Athenaeum logo in white pill left; mobile hamburger; active-route highlight |
| `src/components/Footer.jsx` | Athenaeum logo + tournament name + date/time |
| `src/components/PlayerCard.jsx` | Player headshot (or initials avatar); team badge; captain badge; compact mode for inline lists |
| `src/components/MatchCard.jsx` | Shows round/court, Mix Doubles flag, pair names, result badge, A/B Win buttons (edit mode only), clear button |
| `src/components/Standings.jsx` | Team A vs Blue Crew wins side-by-side; "LEADING" badge; games-completed counter; reads team names from `TOURNAMENT` config |

### 3.4 Frontend — services & data

| File | Purpose |
|------|---------|
| `src/services/api.js` | All API calls; auto-falls back to mock data when `VITE_SHEETS_API_URL` not set |
| `src/hooks/useApi.js` | Generic React hook: `useApi('getPlayers')` returns `{ data, loading, error, reload }` |
| `src/data/mockData.js` | 25 real players (HSB: 12, Blue Crew: 13 — Cora b13 added as captain, 4F+9M) and all 18 match slots with valid no-repeat, no-back-to-back pairings across 9 rounds |
| `src/config.js` | Tournament constants (name, date, times, team captains); Team B name = **Blue Crew**; `RULES` array; env var export |

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
| `initSheets()` | Setup | Creates Players + Schedule tabs with headers + formatting; pre-populates all 18 match slots (9 rounds) |
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
| K | partnerId | `a8` (their partner's player ID) or blank if no partner |

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
| m5  | 3 | S | No  |
| m6  | 3 | N | No  |
| m7  | 4 | S | **Yes ★** |
| m8  | 4 | N | **Yes ★** |
| m9  | 5 | S | **Yes ★** |
| m10 | 5 | N | No  |
| m11 | 6 | S | No  |
| m12 | 6 | N | No  |
| m13 | 7 | S | **Yes ★** |
| m14 | 7 | N | **Yes ★** |
| m15 | 8 | S | No  |
| m16 | 8 | N | No  |
| m17 | 9 | S | **Yes ★** |
| m18 | 9 | N | **Yes ★** |

### 3.7 Branding & assets

| Asset | File | Status | Notes |
|-------|------|--------|-------|
| Athenaeum logo | `src/assets/athenaeum_header_logo.png` | ✅ In use | Burgundy script on white; shown in header pill and footer |
| Courts photo | `src/assets/athenaeum_pickle_courts.jpg` | ✅ In use | Hero background on Home page; compressed from 4.3 MB PNG → 124 KB JPG |
| Team B (Blue Crew) logo | `src/assets/team-b-logo.jpg` | ✅ In use | LA Dodgers logo; shown in Teams page Blue Crew header + Home page team badge |
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
| `blue-600/700` | Tailwind | Blue Crew (Team B) color (all badges, avatars, headers, score buttons) |
| `gray-50` | Tailwind | Page background |

**Note:** Team colors were originally A=blue/B=red, then swapped to A=red/B=blue on June 21 because Blue Crew (Team B) has the Dodgers (blue) logo. Team B display name is "Blue Crew" — set in `src/config.js` and read dynamically by all UI components.

---

## 4. File Structure (current)

```
ath-open/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions — build + deploy to Pages
├── backend/
│   ├── code.gs                     # Google Apps Script — paste into Script Editor
│   ├── ATH_Open_Sheets_Template.xlsx   # Reference spreadsheet (24 players — real names, 18 matches, 9 rounds)
│   ├── generate_template.py        # Regenerates ATH_Open_Sheets_Template.xlsx (.venv/bin/python3 backend/generate_template.py)
│   └── generate_pairings.py        # Generates docs/BlueCrew_Pairings.xlsx (.venv/bin/python3 backend/generate_pairings.py)
├── public/
│   └── assets/                     # Static files (empty — images are in src/assets/)
├── src/
│   ├── assets/
│   │   ├── athenaeum_header_logo.png   # The Athenaeum burgundy script logo
│   │   ├── athenaeum_pickle_courts.jpg # Courts photo (compressed, used as hero bg)
│   │   └── team-b-logo.jpg             # LA Dodgers logo for Blue Crew (Team B)
│   ├── components/
│   │   ├── Header.jsx              # Sticky nav, Athenaeum logo pill, mobile hamburger
│   │   ├── Footer.jsx              # Logo + tournament details
│   │   ├── PlayerCard.jsx          # Headshot/avatar + badges; compact mode
│   │   ├── MatchCard.jsx           # Match display + A/B win entry buttons
│   │   └── Standings.jsx           # Side-by-side team wins + LEADING badge
│   ├── data/
│   │   └── mockData.js             # 25 real players (HSB: 12 / Blue Crew: 13 incl. Cora) + 18 valid matches (9 rounds, no back-to-back)
│   ├── hooks/
│   │   └── useApi.js               # useApi('method') → { data, loading, error, reload }
│   ├── pages/
│   │   ├── Home.jsx                # Hero, stats, CTAs, teams card, rules preview
│   │   ├── Register.jsx            # Player sign-up form
│   │   ├── Teams.jsx               # Two-column rosters with logos
│   │   ├── Schedule.jsx            # Read-only 18-match schedule (9 rounds)
│   │   ├── Scores.jsx              # Live standings + score entry toggle
│   │   └── Rules.jsx               # Full formatted rules
│   ├── services/
│   │   └── api.js                  # Sheets API calls + mock fallback
│   ├── App.jsx                     # HashRouter + layout shell
│   ├── config.js                   # TOURNAMENT constants, RULES array, env var
│   ├── index.css                   # Tailwind directives + .btn-primary, .card etc.
│   └── main.jsx                    # React 18 createRoot entry point
├── docs/
│   ├── 12511.jpg                       # Source file for Blue Crew (Team B) logo (Dodgers)
│   ├── athenaeum_header_logo.png       # Source file for Athenaeum logo
│   ├── athenaeum_pickle_courts.png     # Source PNG for courts (uncompressed original, 4.3 MB)
│   ├── IMG_2787.PNG                    # Screenshot of email with tournament special notes
│   ├── 2 Courts:2 Teams RR Blank Form.docx  # Blank tournament scoring document
│   ├── Team Round Robin Athenaeum.docx      # Filled schedule — Hill Street Blues pairings
│   ├── ATH_Pairings_Matrix.xlsx        # Generated pairings matrix (Hill Street Blues — Team A)
│   └── BlueCrew_Pairings.xlsx          # Generated pairings schedule (Blue Crew — Team B)
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
5. The Schedule tab will have all 18 match slots pre-filled with the correct round/court/Mix Doubles data (9 rounds)

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
2. For each of the 18 rows (m1–m18), fill in columns E–H:
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
| `c7137bb` | Jun 21, 2026 | Locked in final tournament format from docx; cleaned up superseded analysis in ATHOPEN.md |
| `3bfc642` | Jun 21, 2026 | Added Section 11: pairing pre-assignment strategy and fairness analysis |
| `ede69de` | Jun 21, 2026 | Renamed Team B → **Blue Crew**; expanded mock roster to 24 players (12/team, 3F+9M); all UI components read team name from config |
| `ecde6ab` | Jun 21, 2026 | Added `partnerId` field (col K) to Players schema in code.gs, mockData.js, and ATHOPEN.md |
| `bac7f73` | Jun 21, 2026 | Moved xlsx template to `backend/`; saved `generate_template.py` script |
| `f4aadbc` | Jun 22, 2026 | Blue Crew pairings schedule generated (`docs/BlueCrew_Pairings.xlsx`); real player names (HSB + Blue Crew) in mockData.js; updated to 9 rounds / 18 matches across all files |
| *(pending)* | Jun 22, 2026 | Added Cora (b13) as Blue Crew captain (4th woman); Jay+Cora captain pair (1 mixed game, R7N); all 3 regular couples play 2 mixed each (1+2+2+2=7 ✓); added no-back-to-back constraint; new pairings generated; Schedule.jsx shows 9 rounds with times; Section 11 updated |

---

## 9. TODO / Work Remaining

### Must-have before tournament day
- [x] **Connect Google Sheets** — full 8-step connection guide in Section 6 above
- [x] **Finalize tournament format** — 8 rounds, traditional scoring to 11, 11 men's + 5 mixed doubles (Section 10)
- [x] **Team B name** — "Blue Crew" set in config.js, all UI components read it dynamically
- [x] **partnerId field** — added to Players sheet (col K) to track mixed doubles couples
- [x] **Real player names in mock data** — HSB (Suzan, Rachel, Molly, Pierre, Jeff E, Dro, Steve, Mich, Wilfred, Jeff W, Yu Fon, Johnny) and Blue Crew (Alexis, Carmela, Ivy, Jay, Marv, Arman, Jon, Trevor, Richard, Rhon, Joe, Pierre) replace placeholder names
- [x] **Blue Crew pairings generated (iteration 2)** — `docs/BlueCrew_Pairings.xlsx` has full schedule; Cora added as captain (b13, 1 mixed game with Jay in R7N); all 3 couples play 2 mixed; Rhon/Joe play 4 games; no back-to-back games for any player
- [x] **Tournament format corrected to 9 rounds / 18 matches** — actual HSB docx has 9 rounds (not 8); 7 mixed doubles (not 5); all code updated
- [x] **Cora added as Blue Crew captain** — 4th woman (b13); plays exactly 1 game with Jay; other 3 women play 2 each; isCaptain moved from Alexis to Cora
- [ ] **Add real players to Google Sheets** — replace mock roster with actual registered players (via registration form or directly in Players sheet); fill in `partnerId` for couples
- [ ] **Set match pairings** — fill in player IDs in Schedule sheet columns E–H (m1–m18) using `docs/BlueCrew_Pairings.xlsx` and `docs/ATH_Pairings_Matrix.xlsx`
- [ ] **Team A logo** — get a logo image for Team A and wire it in the same way as Blue Crew (Teams page + Home badge)

### Nice-to-have
- [ ] **Captain PIN / score lock** — right now anyone can click "Enter Scores" and change results; a simple 4-digit PIN would restrict this to captains only
- [ ] **Auto-refresh scores** — poll the API every 30–60 seconds so live scores update without manual page reload
- [ ] **Player pairing UI** — let captains assign match pairings from within the app instead of editing the spreadsheet directly
- [ ] **Print scorecard** — a print-friendly `/#/print` page with the full schedule and blank score fields for courtside use
- [ ] **Headshot upload** — currently players paste a URL; could add Google Drive file picker or direct upload to a hosting bucket
- [ ] **Player stats** — track individual win/loss per player across all games they played
- [ ] **Mobile score entry** — make the Scores page faster to use on a phone courtside (larger tap targets, swipe to confirm)

---

## 10. Tournament Format — FINAL DECISION

> **✅ DECIDED Jun 22, 2026 — format locked from actual Hill Street Blues docx.** The blank form had 8 rounds; the actual `Team Round Robin Athenaeum.docx` (Hill Street Blues' filled schedule) has **9 rounds / 18 matches / 7 mixed doubles**. All app files updated to match.

### Confirmed tournament spec

| Parameter | Value | Source |
|-----------|-------|--------|
| Event | Team Round Robin @ The Athenaeum | docx |
| Date | June 28th | docx |
| Warm-up | 8:00 AM | docx |
| Match time | 8:30 AM – Noon | docx |
| Players per team | **12 HSB** (9M + 3F) / **13 Blue Crew** (9M + 4F) | confirmed |
| Total players | **25** | confirmed |
| Courts | **2** — South (S) and North (N) | confirmed |
| Scoring | **Traditional: 11 points, win by 2** | docx |
| At 11-all | Next point wins — **Receivers' Choice** | docx |
| First server | Coin/paddle toss each game | docx |
| Total rounds | **9** | HSB docx |
| Total matches | **18** (9 rounds × 2 courts) | HSB docx |
| Men's Doubles matches | **11** | HSB docx |
| Mixed Doubles matches | **7** (marked ★) | HSB docx |
| Games per man | **3 most men, 2 must play 4** (unavoidable — see math) | calculated |
| Games per woman | **Captain plays 1, other 3 women play 2 each** (1+2+2+2=7 ✓ — Cora plays only with Jay) | confirmed |
| Score reporting | **WIN ONLY** to captain | docx |
| Team A captain | **Suzan** | docx |
| Team B captain | **Cora** | confirmed |

---

### Match schedule — confirmed from HSB docx

Mixed Doubles (★) in rounds 4, 5 (South only), 7, and 9.

| Round | South Court | North Court | Notes |
|-------|-------------|-------------|-------|
| 1 | Men's Doubles | Men's Doubles | — |
| 2 | Men's Doubles | Men's Doubles | — |
| 3 | Men's Doubles | Men's Doubles | — |
| 4 | **Mix Doubles ★** | **Mix Doubles ★** | Both courts mixed |
| 5 | **Mix Doubles ★** | Men's Doubles | South only |
| 6 | Men's Doubles | Men's Doubles | — |
| 7 | **Mix Doubles ★** | **Mix Doubles ★** | Both courts mixed |
| 8 | Men's Doubles | Men's Doubles | — |
| 9 | **Mix Doubles ★** | **Mix Doubles ★** | Both courts mixed |

Mixed Doubles: R4S, R4N, R5S, R7S, R7N, R9S, R9N = **7 mixed matches**  
Men's Doubles: all other slots = **11 men's matches**  
Total: **18 matches** ✅

---

### Why this format works for 9M + 3W per team

#### Men — why 2 players must play 4 games
```
11 men's doubles × 2 men per side = 22 men's slots
 7 mixed doubles  × 1 man per side =  7 men's slots  (one couple man per match)
                           Total  = 29 men's slots

3 couples → their men contribute:
  couple A (3 mixed): 0 men's doubles games
  couple B (2 mixed): 1 men's doubles game
  couple C (2 mixed): 1 men's doubles game
  Subtotal = 2 men's player-slots

6 non-couple men fill: 22 - 2 = 20 men's slots
20 ÷ 6 = 3 remainder 2  → exactly 2 men play 4 games, 4 men play 3 games
```

Every man plays **3 or 4 games**, each time with a different partner. No man repeats a partner.

#### Women — distribution with 4 women (Cora as captain)

Blue Crew has **4 women** with the following rules:
- Cora (captain) plays **exactly 1** mixed game — with Jay (not a fixed couple, a captain pair)
- Each of the 3 other women plays **exactly 2** mixed games with her fixed couple partner

```
Cora (captain):  1 game (with Jay)
Alexis:          2 games (with Trevor)
Carmela:         2 games (with Marv)
Ivy:             2 games (with Pierre)
Total: 1+2+2+2 = 7 ✅ — perfectly fills all 7 mixed slots
```

Hill Street Blues women: Suzan=1, Rachel=3, Molly=3 (distribution 1,3,3)  
Blue Crew women: Cora=1, Alexis=2, Carmela=2, Ivy=2 (distribution 1,2,2,2) ✓

#### Men's game count verification
```
All-men's rounds (R1, R2, R3, R6, R8 — both courts men's): 5 × 4 = 20 slots
Split round (R5 — South mixed, North men's): 1 × 2 = 2 slots
Total men's player-slots: 22  ✅ (11 matches × 2)

Mixed men contributions:
  Jay:    1 mixed → 2 men's games
  Trevor: 2 mixed → 1 men's game
  Marv:   2 mixed → 1 men's game
  Pierre: 2 mixed → 1 men's game
  Subtotal: 2+1+1+1 = 5 men's player-slots

Non-mixed men (Arman, Jon, Richard, Rhon, Joe): 22 - 5 = 17 slots / 5 men
  17 ÷ 5 = 3 remainder 2 → exactly 2 men play 4 games, 3 play 3  ✓
```

---

### Timeline with traditional scoring

```
Traditional scoring to 11, win by 2
Average game duration:        ~18 minutes (recreational level)
Court changeover / rotation:   ~3 minutes
Per round (wait for both courts): ~21 minutes average

9 rounds × 21 min = 189 min = 3 hr 9 min
Start: 8:30 AM
Finish: ~11:39 AM
Buffer before noon: ~21 minutes ✅ (tight but doable)
```

The 21-minute buffer is tighter than the old 8-round estimate but still workable. The safety valve is: **at 11-all the next point wins (Receivers' Choice)** — prevents infinite deuce loops.

---

### All open questions — resolved

| # | Question | Decision |
|---|----------|----------|
| 1 | Scoring format? | ✅ **Traditional to 11, win by 2. At 11-all Receivers' Choice.** |
| 2 | Round count? | ✅ **9 rounds (from actual HSB docx, not blank form)** |
| 3 | Courts? | ✅ **2 — North and South** |
| 4 | Mixed Doubles count? | ✅ **7** (R4S, R4N, R5S, R7S, R7N, R9S, R9N) |
| 5 | Blue Crew pairing schedule? | ✅ **Generated — `docs/BlueCrew_Pairings.xlsx`** |
| 6 | Skill-based seeding? | ✅ **Random draw (no DUPR, playing for fun)** |

---

### What's left before tournament day

1. **Enter real players** — replace mock roster with actual registered players via the registration form or directly in the Players sheet
2. **Set match pairings in Schedule sheet** — fill columns E–H (m1–m18) using `docs/BlueCrew_Pairings.xlsx` for Blue Crew and `docs/ATH_Pairings_Matrix.xlsx` for Hill Street Blues

---


## 11. Blue Crew Pairings — Complete Schedule & Documentation

> Script: `backend/generate_pairings.py`  
> Output: `docs/BlueCrew_Pairings.xlsx` (3 tabs: Full Schedule, Blue Crew Matrix, Player Summary)  
> Run: `.venv/bin/python3 backend/generate_pairings.py`

---

### 11.1 The current schedule (as of June 22, 2026 — iteration 2)

**Key changes in this iteration vs the first:**
- Cora added as Blue Crew captain (4th woman, id `b13`)
- Jay+Cora are the captain pair — they play exactly **1 mixed game together** (R7N)
- All 3 regular couples play exactly **2 mixed games each** (1+2+2+2=7 ✓)
- `FORCED_TRIPLE` removed — no longer needed with 4 women
- **No back-to-back games**: no player plays in two consecutive rounds (constraint enforced by algorithm)
- Jay's mixed partner is no longer counted as a "couple" — it's a special captain pair

#### Full 18-match schedule — Blue Crew side only

| Match | Round | Time | Court | Type | Blue Crew Player 1 | Blue Crew Player 2 |
|-------|-------|------|-------|------|-------------------|-------------------|
| m1  | 1 | 8:30 am | South | Men's | Richard | Joe |
| m2  | 1 | 8:30 am | North | Men's | Trevor | Rhon |
| m3  | 2 | 8:50 am | South | Men's | Arman | Pierre |
| m4  | 2 | 8:50 am | North | Men's | Marv | Jon |
| m5  | 3 | 9:15 am | South | Men's | Rhon | Joe |
| m6  | 3 | 9:15 am | North | Men's | Jay | Richard |
| m7  | 4 | 9:40 am | South | **Mix ★** | **Pierre** | **Ivy** |
| m8  | 4 | 9:40 am | North | **Mix ★** | **Marv** | **Carmela** |
| m9  | 5 | 10:10 am | South | **Mix ★** | **Trevor** | **Alexis** |
| m10 | 5 | 10:10 am | North | Men's | Jay | Rhon |
| m11 | 6 | 10:30 am | South | Men's | Arman | Richard |
| m12 | 6 | 10:30 am | North | Men's | Jon | Joe |
| m13 | 7 | 11:00 am | South | **Mix ★** | **Pierre** | **Ivy** |
| m14 | 7 | 11:00 am | North | **Mix ★** | **Jay** | **Cora** ← captain's game |
| m15 | 8 | 11:30 am | South | Men's | Arman | Joe |
| m16 | 8 | 11:30 am | North | Men's | Jon | Rhon |
| m17 | 9 | — | South | **Mix ★** | **Trevor** | **Alexis** |
| m18 | 9 | — | North | **Mix ★** | **Marv** | **Carmela** |

Mixed doubles shown in **bold**. Couples always play together. Jay+Cora is the captain pair (R7N only).

---

#### Per-player game log

| Player | Gender | Role | Mix | Men's | Total | Round-by-round games |
|--------|--------|------|-----|-------|-------|----------------------|
| **Cora** | F | Captain | 1 | 0 | **1** | R7N★ w/Jay |
| **Alexis** | F | Couple (Trevor) | 2 | 0 | **2** | R5S★ w/Trevor, R9S★ w/Trevor |
| **Carmela** | F | Couple (Marv) | 2 | 0 | **2** | R4N★ w/Marv, R9N★ w/Marv |
| **Ivy** | F | Couple (Pierre) | 2 | 0 | **2** | R4S★ w/Pierre, R7S★ w/Pierre |
| **Jay** | M | Captain pair (Cora) | 1 | 2 | **3** | R3N w/Richard, R5N w/Rhon, R7N★ w/Cora |
| **Marv** | M | Couple (Carmela) | 2 | 1 | **3** | R2N w/Jon, R4N★ w/Carmela, R9N★ w/Carmela |
| **Trevor** | M | Couple (Alexis) | 2 | 1 | **3** | R1N w/Rhon, R5S★ w/Alexis, R9S★ w/Alexis |
| **Pierre** | M | Couple (Ivy) | 2 | 1 | **3** | R2S w/Arman, R4S★ w/Ivy, R7S★ w/Ivy |
| **Arman** | M | — | 0 | 3 | **3** | R2S w/Pierre, R6S w/Richard, R8S w/Joe |
| **Jon** | M | — | 0 | 3 | **3** | R2N w/Marv, R6N w/Joe, R8N w/Rhon |
| **Richard** | M | — | 0 | 3 | **3** | R1S w/Joe, R3N w/Jay, R6S w/Arman |
| **Rhon** | M | — | 0 | 4 | **4** | R1N w/Trevor, R3S w/Joe, R5N w/Jay, R8N w/Jon |
| **Joe** | M | — | 0 | 4 | **4** | R1S w/Richard, R3S w/Rhon, R6N w/Jon, R8S w/Arman |

---

#### No-back-to-back check

No player plays in two consecutive rounds. Verified for each player:

| Player | Rounds played | Gaps (all ≥ 2) | Back-to-back? |
|--------|---------------|----------------|---------------|
| Cora | R7 | — | ✅ |
| Alexis | R5, R9 | 4 | ✅ |
| Carmela | R4, R9 | 5 | ✅ |
| Ivy | R4, R7 | 3 | ✅ |
| Jay | R3, R5, R7 | 2, 2 | ✅ |
| Marv | R2, R4, R9 | 2, 5 | ✅ |
| Trevor | R1, R5, R9 | 4, 4 | ✅ |
| Pierre | R2, R4, R7 | 2, 3 | ✅ |
| Arman | R2, R6, R8 | 4, 2 | ✅ |
| Jon | R2, R6, R8 | 4, 2 | ✅ |
| Richard | R1, R3, R6 | 2, 3 | ✅ |
| Rhon | R1, R3, R5, R8 | 2, 2, 3 | ✅ |
| Joe | R1, R3, R6, R8 | 2, 3, 2 | ✅ |

---

#### No same-round conflict check

| Round | South Court (BC players) | North Court (BC players) | Any overlap? |
|-------|--------------------------|--------------------------|--------------|
| R1 | Richard, Joe | Trevor, Rhon | ✅ None |
| R2 | Arman, Pierre | Marv, Jon | ✅ None |
| R3 | Rhon, Joe | Jay, Richard | ✅ None |
| R4 | Pierre, Ivy ★ | Marv, Carmela ★ | ✅ None |
| R5 | Trevor, Alexis ★ | Jay, Rhon | ✅ None |
| R6 | Arman, Richard | Jon, Joe | ✅ None |
| R7 | Pierre, Ivy ★ | Jay, Cora ★ | ✅ None |
| R8 | Arman, Joe | Jon, Rhon | ✅ None |
| R9 | Trevor, Alexis ★ | Marv, Carmela ★ | ✅ None |

---

#### No-repeat-partner check — men's doubles only

| Match | Pair |
|-------|------|
| m1 R1S | Richard + Joe |
| m2 R1N | Trevor + Rhon |
| m3 R2S | Arman + Pierre |
| m4 R2N | Marv + Jon |
| m5 R3S | Rhon + Joe |
| m6 R3N | Jay + Richard |
| m10 R5N | Jay + Rhon |
| m11 R6S | Arman + Richard |
| m12 R6N | Jon + Joe |
| m15 R8S | Arman + Joe |
| m16 R8N | Jon + Rhon |

Every pair appears exactly once. No man repeats a men's doubles partner. ✅

---

### 11.2 Why certain game counts are unavoidable

#### Women — why (1,2,2,2) is the right distribution

With 4 women and 7 mixed slots:
- Cora (captain) plays 1 game — this is the captain's format, she plays only with Jay
- The remaining 6 slots go to 3 women at exactly 2 each: 3 × 2 = 6 ✓
- No woman is burdened with 3 games; the captain's single game is by design

This is **more equitable** than the previous iteration (which had one woman play 3 games):
```
Old (3 women): (3,2,2) — one woman plays 50% more than the others
New (4 women): (1,2,2,2) — captain plays 1 by design; others equal at 2
```

#### Why Jay gets 2 men's games (not 3)

Jay plays 1 mixed game (with Cora). Total games = 3. So he plays 2 men's doubles.

This is the same total as all other couple/captain-pair men:
- Trevor: 2 mixed + 1 men's = 3 total
- Marv: 2 mixed + 1 men's = 3 total
- Pierre: 2 mixed + 1 men's = 3 total
- Jay: 1 mixed + 2 men's = 3 total ✓

#### Why two non-mixed men must play 4 games

```
22 men's player-slots total (11 matches × 2)
Jay:    1 mixed → 2 men's slots
Trevor: 2 mixed → 1 men's slot
Marv:   2 mixed → 1 men's slot
Pierre: 2 mixed → 1 men's slot
Subtotal from mixed men: 2+1+1+1 = 5 men's player-slots used

Remaining for non-mixed men (Arman, Jon, Richard, Rhon, Joe):
  22 - 5 = 17 slots / 5 men
  17 ÷ 5 = 3 remainder 2
  → 3 men play 3 games, 2 men play 4 games  (unavoidable)
```

In the current schedule: **Rhon and Joe** each play 4 games. Controlled by `FORCED_QUAD_MEN`.

---

### 11.3 How the algorithm works (step by step)

The script `backend/generate_pairings.py` runs these steps in order:

#### Step 1 — Initialise RNG
`RANDOM_SEED` is either an integer (reproducible) or `None` (new random draw each run).

#### Step 2 — Assign pairs to mixed slots (backtracking)
The 7 mixed slots are: R4S, R4N, R5S, R7S, R7N, R9S, R9N.

Four "pairs" need slots:
- `CAPTAIN_PAIR` (Jay+Cora) — gets **1** slot
- `COUPLES[0]` (Trevor+Alexis) — gets **2** slots
- `COUPLES[1]` (Marv+Carmela) — gets **2** slots
- `COUPLES[2]` (Pierre+Ivy) — gets **2** slots

The backtracking enforces two constraints:
1. **No pair in same round twice** (can't be on both courts of the same round)
2. **No pair in adjacent rounds** (no back-to-back)

```
❌ PREVENTED: Marv+Carmela in R4 and R5 → gap of 1 (back-to-back)
✅ ALLOWED: Marv+Carmela in R4 and R9 → gap of 5
```

#### Step 3 — Calculate each man's men's doubles game count

For men who play mixed:
- Jay (1 mixed): 3 total − 1 = **2 men's games**
- Trevor, Marv, Pierre (2 mixed each): 3 total − 2 = **1 men's game each**

For non-mixed men (Arman, Jon, Richard, Rhon, Joe):
- 17 slots ÷ 5 men = 3 rem 2 → 2 play 4, 3 play 3
- Which 2 play 4: random unless overridden by `FORCED_QUAD_MEN`

#### Step 4 — Generate valid men's doubles pairs (backtracking)
Build a pool: `Rhon×4, Joe×4, Arman×3, Jon×3, Richard×3, Jay×2, Trevor×1, Marv×1, Pierre×1`

Backtracking with **no repeated partners** — most-constrained player first heuristic. Any `PINNED_PAIRS` are pre-placed.

#### Step 5 — Assign pairs to men's doubles slots (backtracking)
Place 11 pairs into 11 slots. Three constraints checked per slot:
1. **No player on two courts of same round**
2. **No player in two adjacent rounds (back-to-back)**
3. **No player in a round adjacent to their mixed game** (e.g. Trevor plays mixed R5+R9 → men's game can't be R4, R6, or R8)

#### Step 6 — Validate and exit on error
Script checks all three constraints on the full schedule and exits with a clear error message if any are violated.

---

### 11.4 How to tweak the schedule

Open `backend/generate_pairings.py` — the configuration block is at the very top:

```python
RANDOM_SEED     = None    # Set to integer for reproducible draw (e.g. 42)
FORCED_QUAD_MEN = None    # Which 2 non-mixed men play 4 games: e.g. ['b4','b5']
PINNED_PAIRS    = []      # Force specific men's doubles pairings: e.g. [('b2','b5')]
```

#### Scenario A — "I want Arman and Jon to be the two who play 4 games"

```python
FORCED_QUAD_MEN = ['b4', 'b5']   # b4=Arman, b5=Jon
```

#### Scenario B — "I want Jay and Jon to always play together in men's doubles"

```python
PINNED_PAIRS = [('b2', 'b5')]   # b2=Jay, b5=Jon
```

#### Scenario C — "I want the exact same random draw every time"

```python
RANDOM_SEED = 42    # any integer; same seed = same output
```

#### Scenario D — "I want to completely hand-craft the schedule"

Edit `src/data/mockData.js` directly, changing `teamBP1`/`teamBP2` for each match row.

Player ID reference:
```
b13=Cora   b1=Alexis  b9=Carmela b10=Ivy
b2=Jay     b3=Marv    b6=Trevor  b12=Pierre
b4=Arman   b5=Jon     b7=Richard b8=Rhon   b11=Joe
```

#### Scenario E — "Generate and review several draws before picking one"

```python
RANDOM_SEED = 1   # run, review
RANDOM_SEED = 2   # run, review
RANDOM_SEED = 3   # run, review
```

Each produces a different valid schedule. When you pick one you like, leave that seed set.

---

### 11.5 What to do with the output

1. Open `docs/BlueCrew_Pairings.xlsx` → **Full Schedule** tab: both teams side by side
2. Check **Blue Crew Matrix** tab: 13×13 grid (C★=captain game, M★=mixed, X=men's)
3. Check **Player Summary** tab: each player's total / mix / men's count and games in order
4. Copy Blue Crew player IDs into Google Sheets **Schedule** tab columns G+H (m1–m18)
5. Or print the xlsx as a reference card for tournament day

---

## 12. Pairing Schedule — Pre-Assignment Strategy

> **Decision: pre-assign ALL pairings before tournament day.** Do not leave partner assignments to be figured out on the court.

### Why this matters

With 9 men per team and 3 playing per round, there are C(9,2) = 36 possible pairs but only 11 men's doubles slots — so the schedule is tight. The no-repeat-partner constraint makes it non-trivial to figure out on the fly. In 60 seconds between rounds, with 24 people waiting, it's easy to accidentally repeat a pairing.

A printed card is the answer. With pre-assigned pairings, the captain reads off names rather than doing live combinatorics while also tracking scores.

### Men's doubles game structure

| Player type | Mixed games | Men's doubles | Total games |
|-------------|-------------|---------------|-------------|
| Captain (Cora) | 1 | 0 | **1** |
| Captain pair man (Jay) | 1 | 2 | **3** |
| Couple man (Trevor/Marv/Pierre) | 2 | 1 | **3** |
| Non-mixed man (most) | 0 | 3 | **3** |
| Non-mixed man (2 of 5) | 0 | 4 | **4** |

The 4-game men are unavoidable — see Section 11.2 for the math.

### Why couples in mixed doubles is the right call for this iteration

1. Removes scheduling complexity: each woman's game slots are entirely determined by her couple's assignment — no need to think about who she'll play with
2. Socially natural: couples want to play together, and this format guarantees it
3. With Cora as captain (1 game only), the distribution (1,2,2,2) is perfectly equitable — the captain's single game is by design, not a constraint

---

## 13. Known Issues / Notes

- The `node_modules/` deprecation warning about Node.js 20 in GitHub Actions is cosmetic — the build succeeds. Will auto-resolve when GitHub upgrades runner defaults.
- Source image files (`12511.jpg`, `athenaeum_header_logo.png`, `athenaeum_pickle_courts.png`, `IMG_2787.PNG`) and docx files have been moved to `docs/`. They are not served by the app — the app uses compressed copies in `src/assets/`.
- The `.venv/` Python virtual environment is gitignored. It contains `openpyxl`, `python-docx`, and `Pillow`, used during development to read the `.docx` file, compress images, and generate xlsx files.
- `backend/generate_pairings.py` uses `random.seed()` with no argument by default, so each run produces a different pairing draw. Set `RANDOM_SEED` at the top of the script to an integer to get a reproducible draw. Re-run to get a new randomized schedule; `docs/BlueCrew_Pairings.xlsx` will be overwritten.
- The first generated pairings (commit `f4aadbc`) had a scheduling bug: the same player appeared on two courts in the same round simultaneously (Jay in R2S+R2N, Arman in R8S+R8N, Marv+Carmela in R7S+R7N). Fixed in the next commit by adding round-conflict backtracking to the assignment step.
