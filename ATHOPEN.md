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
| Women's play | One woman plays 3 games, two play 2 (unavoidable with 7 mixed slots / 3 couples) |
| Mix Doubles rounds | R4 (both), R5 (South only), R7 (both), R9 (both) = 7 Mix games |
| Team A captain | Suzan |
| Team B captain | Alexis |
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
| `src/data/mockData.js` | 24 real players (HSB + Blue Crew names, 12 per team: 3F + 9M, `partnerId` for couples) and all 18 match slots with valid no-repeat pairings across 9 rounds |
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
│   │   └── mockData.js             # 24 real players (HSB + Blue Crew names, 12/team) + 18 valid matches (9 rounds)
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
| *(pending)* | Jun 22, 2026 | Blue Crew pairings schedule generated (`docs/BlueCrew_Pairings.xlsx`); real player names (HSB + Blue Crew) in mockData.js; updated to 9 rounds / 18 matches across all files |

---

## 9. TODO / Work Remaining

### Must-have before tournament day
- [x] **Connect Google Sheets** — full 8-step connection guide in Section 6 above
- [x] **Finalize tournament format** — 8 rounds, traditional scoring to 11, 11 men's + 5 mixed doubles (Section 10)
- [x] **Team B name** — "Blue Crew" set in config.js, all UI components read it dynamically
- [x] **partnerId field** — added to Players sheet (col K) to track mixed doubles couples
- [x] **Real player names in mock data** — HSB (Suzan, Rachel, Molly, Pierre, Jeff E, Dro, Steve, Mich, Wilfred, Jeff W, Yu Fon, Johnny) and Blue Crew (Alexis, Carmela, Ivy, Jay, Marv, Arman, Jon, Trevor, Richard, Rhon, Joe, Pierre) replace placeholder names
- [x] **Blue Crew pairings generated** — `docs/BlueCrew_Pairings.xlsx` has full schedule; `backend/generate_pairings.py` saved for re-runs; Trevor/Alexis get 3 mixed, others get 2; Arman/Richard play 4 games
- [x] **Tournament format corrected to 9 rounds / 18 matches** — actual HSB docx has 9 rounds (not 8); 7 mixed doubles (not 5); all code updated
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
| Players per team | **12** (9 men + 3 women) | confirmed |
| Total players | **24** | confirmed |
| Courts | **2** — South (S) and North (N) | confirmed |
| Scoring | **Traditional: 11 points, win by 2** | docx |
| At 11-all | Next point wins — **Receivers' Choice** | docx |
| First server | Coin/paddle toss each game | docx |
| Total rounds | **9** | HSB docx |
| Total matches | **18** (9 rounds × 2 courts) | HSB docx |
| Men's Doubles matches | **11** | HSB docx |
| Mixed Doubles matches | **7** (marked ★) | HSB docx |
| Games per man | **3 most men, 2 must play 4** (unavoidable — see math) | calculated |
| Games per woman | **One woman plays 3, two play 2** (unavoidable with 7 slots / 3 couples) | calculated |
| Score reporting | **WIN ONLY** to captain | docx |
| Team A captain | **Suzan** | docx |
| Team B captain | **Alexis** | confirmed |

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

#### Women — why one woman plays 3 games
```
7 mixed doubles × 1 woman per side = 7 women's slots
3 couples → distribute 7 slots: only (3,2,2) is possible (no way to fit 7 into 3 groups ≤2)
→ one woman plays 3 games, two play 2 games
```

Hill Street Blues women: Suzan=1, Rachel=3, Molly=3 (distribution 3,3,1)  
Blue Crew women: Alexis=3 (couple drew 3 mixed), Carmela=2, Ivy=2 (distribution 3,2,2)

#### Men's game count verification
```
All-men's rounds (R1, R2, R3, R6, R8 — both courts men's): 5 × 4 = 20 slots
Split round (R5 — South mixed, North men's): 1 × 2 = 2 slots
Total men's player-slots: 22  ✅ (11 matches × 2)

Total game appearances for all men:
  22 (men's) + 7 (mixed) = 29 player-slots
  Couple men: 3+1+1 = 5  →  non-couple: 24 slots / 6 men → 2×4 + 4×3  ✓
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


## 11. Blue Crew Pairings — Generated Schedule

### Output: `docs/BlueCrew_Pairings.xlsx`

Generated by `.venv/bin/python3 backend/generate_pairings.py`. Run again for a new random draw.

The xlsx has 3 tabs: **Full Schedule** (both teams side by side), **Blue Crew Matrix** (who played with whom), **Player Summary** (games per player + all partners listed).

### Blue Crew (Team B) — player game counts

| Player | Gender | Couple partner | Mix games | Men's games | Total | Notes |
|--------|--------|---------------|-----------|-------------|-------|-------|
| Alexis | F | Trevor | 3 | 0 | **3** | One couple draws 3 mixed (unavoidable with 7 slots / 3 couples) |
| Carmela | F | Marv | 2 | 0 | **2** | |
| Ivy | F | Pierre | 2 | 0 | **2** | |
| Jay | M | — | 0 | 3 | **3** | |
| Marv | M | Carmela | 2 | 1 | **3** | |
| Arman | M | — | 0 | 4 | **4** | One of 2 men who play 4 games (unavoidable — 20 slots / 6 men → 2 remainder) |
| Jon | M | — | 0 | 3 | **3** | |
| Trevor | M | Alexis | 3 | 0 | **3** | |
| Richard | M | — | 0 | 4 | **4** | One of 2 men who play 4 games |
| Rhon | M | — | 0 | 3 | **3** | |
| Joe | M | — | 0 | 3 | **3** | |
| Pierre | M | Ivy | 2 | 1 | **3** | |

### Constraints satisfied

- ✅ Couples (Trevor↔Alexis, Marv↔Carmela, Pierre↔Ivy) play together in all their mixed doubles games
- ✅ No man repeats a partner across all 11 men's doubles slots
- ✅ Mixed slots match HSB structure exactly (R4S, R4N, R5S, R7S, R7N, R9S, R9N)
- ✅ Random draw — no skill ranking (no DUPR, playing for fun)
- ✅ Distribution (3,2,2) for women — minimum possible inequality with 7 slots
- ✅ 2 men play 4 games (Arman, Richard) — mathematically unavoidable

### Future iteration

The user noted a second iteration where women play 1 game with their preferred partner and 1 game with a random partner. The current cut locks all mixed doubles to fixed couples.

---

## 12. Pairing Schedule — Pre-Assignment Strategy

> **Decision: pre-assign ALL pairings before tournament day** — mixed doubles couples, men's doubles partners, and sit-out rotations. Do not leave any of these to be figured out on the court.

### Why the captain's husband and all men's doubles partners must be pre-assigned

The captain has to satisfy a **no-repeat-partners constraint** across 11 men's doubles matches while simultaneously running scorecards and managing rotations. That is a combinatorics problem under time pressure with 24 people waiting. It is very easy to accidentally pair the same two guys again in round 7 without realizing it.

With pre-set couples for mixed doubles, the full picture per man is:

| Player type | Mixed games | Men's doubles games | Partner variety needed |
|-------------|-------------|---------------------|------------------------|
| 6 non-husband men | 0 | 3 | 3 different partners across 3 rounds |
| Captain's husband | 1 (with captain) | 2 | 2 different men's doubles partners |
| 2 other husbands | 2 (with wife) | 1 | 1 different men's doubles partner |

Every one of those men's doubles slots needs a pre-assigned partner to guarantee no repeats.

### Why pre-assignment wins over improvising on the day

1. **No-repeat math is non-trivial at 9 people** — 9 men × 3 games, different partner each time, across 11 men's doubles matches. C(9,2) = 36 possible pairs to choose from but scheduling them without collisions across rounds requires actual planning. Not guessable in 60 seconds between rounds.

2. **Captain's cognitive load on the day** — she is tracking wins, filling out the score sheet, and managing subs if someone gets hurt. A printed card she just reads off is a huge relief vs. doing partner math live.

3. **Round speed** — with a card, pairings are announced in 30 seconds. Without one, the captain has to think through "who has already played with whom" for 9 men before every round.

4. **It's what the docx was built for** — the blank form has columns for both players on each side. Those blanks are meant to be filled in before the day, not penciled in on the court.

### Mixed doubles couples — fairness analysis

Mixed doubles teams are pre-set (husband/wife). This affects game distribution but does NOT create inequality in game count:

| Player | Mixed games | Men's doubles games | Total |
|--------|-------------|---------------------|-------|
| Non-captain wife's husband | 2 | 1 | **3** |
| Captain's husband | 1 | 2 | **3** |
| 6 non-husband men | 0 | 3 | **3** |

All 9 men play exactly 3 games. Husbands swap some men's doubles slots for mixed doubles slots — same count, different flavor.

### Women — game count vs men (by design)

Women play fewer games than men due to the 9M + 3W per team ratio and 5 mixed doubles slots:

| Player | Games | Notes |
|--------|-------|-------|
| Each man | **3** | — |
| Non-captain woman | **2** | Plays in 2 of the 5 mixed rounds |
| Captain | **1** | Intentional — she runs the day |

The docx explicitly specifies this: *"2 women play 2 games; captain plays 1 game."* The captain playing once is a role tradeoff, not an oversight. The only way to give women equal games to men would be switching to 9 rounds with 9 mixed doubles (the format we analyzed before locking in the docx).

### Mixed slot distribution with pre-set couples

| Round | Court | Slot | Team A | Team B |
|-------|-------|------|--------|--------|
| 3 | S | Mix | Non-captain Woman A1 + husband | Non-captain Woman B1 + husband |
| 3 | N | Mix | Non-captain Woman A2 + husband | Non-captain Woman B2 + husband |
| 4 | S | Mix | Captain A + her husband | Captain B + her husband |
| 6 | S | Mix | Non-captain Woman A1 + husband | Non-captain Woman B1 + husband |
| 6 | N | Mix | Non-captain Woman A2 + husband | Non-captain Woman B2 + husband |

Result: Woman A1 = 2 games, Woman A2 = 2 games, Captain = 1 game. Matches the docx exactly.

### What to generate (next step)

A single reference card (or pre-filled Schedule sheet tab) covering all 16 match rows:

| Match | Round | Court | Type | Team A P1 | Team A P2 | Team B P1 | Team B P2 |
|-------|-------|-------|------|-----------|-----------|-----------|-----------|
| m1 | 1 | S | Men | Man A? | Man A? | Man B? | Man B? |
| m5 | 3 | S | Mix | Husband A1 | Wife A1 | Husband B1 | Wife B1 |
| … | … | … | … | … | … | … | … |

**Inputs needed before this can be generated:**
- Real names of all 9 men per team
- Which 3 men are the husbands (and which woman each is paired with)
- Whether to seed by skill level or draw randomly for men's doubles pairings

Once those are provided, a valid full schedule (all 16 matches, all pairings, no man repeats a partner) can be generated and entered into the Schedule sheet columns E–H.

---

## 13. Known Issues / Notes

- The `node_modules/` deprecation warning about Node.js 20 in GitHub Actions is cosmetic — the build succeeds. Will auto-resolve when GitHub upgrades runner defaults.
- Source image files (`12511.jpg`, `athenaeum_header_logo.png`, `athenaeum_pickle_courts.png`, `IMG_2787.PNG`) and docx files have been moved to `docs/`. They are not served by the app — the app uses compressed copies in `src/assets/`.
- The `.venv/` Python virtual environment is gitignored. It contains `openpyxl`, `python-docx`, and `Pillow`, used during development to read the `.docx` file, compress images, and generate xlsx files.
- `backend/generate_pairings.py` uses `random.seed()` with no argument, so each run produces a different pairing draw. Re-run to get a new randomized schedule; the `docs/BlueCrew_Pairings.xlsx` will be overwritten.
