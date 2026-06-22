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
| `f4aadbc` | Jun 22, 2026 | Blue Crew pairings schedule generated (`docs/BlueCrew_Pairings.xlsx`); real player names (HSB + Blue Crew) in mockData.js; updated to 9 rounds / 18 matches across all files |
| *(pending)* | Jun 22, 2026 | Fixed scheduling bug (same-round player conflicts); added round-conflict backtracking to `generate_pairings.py`; wrote full pairing documentation in ATHOPEN.md Section 11 |

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


## 11. Blue Crew Pairings — Complete Schedule & Documentation

> Script: `backend/generate_pairings.py`  
> Output: `docs/BlueCrew_Pairings.xlsx` (3 tabs: Full Schedule, Blue Crew Matrix, Player Summary)  
> Run: `.venv/bin/python3 backend/generate_pairings.py`

---

### 11.1 The current schedule (as of June 22, 2026)

This is the schedule that was generated and saved. It is the one currently in `docs/BlueCrew_Pairings.xlsx`.

#### Full 18-match schedule — Blue Crew side only

| Match | Round | Time | Court | Type | Blue Crew Player 1 | Blue Crew Player 2 |
|-------|-------|------|-------|------|-------------------|-------------------|
| m1  | 1 | 8:30 am | South | Men's | Arman | Rhon |
| m2  | 1 | 8:30 am | North | Men's | Jon | Richard |
| m3  | 2 | 8:50 am | South | Men's | Arman | Joe |
| m4  | 2 | 8:50 am | North | Men's | Jay | Rhon |
| m5  | 3 | 9:15 am | South | Men's | Jay | Richard |
| m6  | 3 | 9:15 am | North | Men's | Arman | Pierre |
| m7  | 4 | 9:40 am | South | **Mix ★** | **Marv** | **Carmela** |
| m8  | 4 | 9:40 am | North | **Mix ★** | **Trevor** | **Alexis** |
| m9  | 5 | 10:10 am | South | **Mix ★** | **Marv** | **Carmela** |
| m10 | 5 | 10:10 am | North | Men's | Jon | Joe |
| m11 | 6 | 10:30 am | South | Men's | Jay | Joe |
| m12 | 6 | 10:30 am | North | Men's | Trevor | Jon |
| m13 | 7 | 11:00 am | South | **Mix ★** | **Trevor** | **Alexis** |
| m14 | 7 | 11:00 am | North | **Mix ★** | **Pierre** | **Ivy** |
| m15 | 8 | 11:30 am | South | Men's | Richard | Rhon |
| m16 | 8 | 11:30 am | North | Men's | Jon | Joe |
| m17 | 9 | — | South | **Mix ★** | **Pierre** | **Ivy** |
| m18 | 9 | — | North | **Mix ★** | **Marv** | **Carmela** |

Mixed doubles shown in **bold**. Couples are always together.

---

#### Per-player game log

Every man's games listed in round order — use this to verify no one plays twice in the same round and no partner repeats.

| Player | Gender | Couple | Mix | Men's | Total | Round-by-round games |
|--------|--------|--------|-----|-------|-------|----------------------|
| **Alexis** | F | Trevor | 2 | 0 | **2** | R4N★ w/Trevor, R7S★ w/Trevor |
| **Carmela** | F | Marv | 3 | 0 | **3** | R4S★ w/Marv, R5S★ w/Marv, R9N★ w/Marv |
| **Ivy** | F | Pierre | 2 | 0 | **2** | R7N★ w/Pierre, R9S★ w/Pierre |
| **Jay** | M | — | 0 | 3 | **3** | R2N w/Rhon, R3S w/Richard, R6S w/Joe |
| **Marv** | M | Carmela | 3 | 0 | **3** | R4S★ w/Carmela, R5S★ w/Carmela, R9N★ w/Carmela |
| **Arman** | M | — | 0 | 4 | **4** | R1S w/Rhon, R2S w/Joe, R3N w/Pierre, R5N w/Richard |
| **Jon** | M | — | 0 | 3 | **3** | R1N w/Richard, R5N... wait — see note below |
| **Trevor** | M | Alexis | 2 | 1 | **3** | R4N★ w/Alexis, R6N w/Jon, R7S★ w/Alexis |
| **Richard** | M | — | 0 | 4 | **4** | R1N w/Jon, R3S w/Jay, R5N w/Arman, R8S w/Rhon |
| **Rhon** | M | — | 0 | 3 | **3** | R1S w/Arman, R2N w/Jay, R8S w/Richard |
| **Joe** | M | — | 0 | 3 | **3** | R2S w/Arman, R6S w/Jay, R8N w/Jon |
| **Pierre** | M | Ivy | 2 | 1 | **3** | R3N w/Arman, R7N★ w/Ivy, R9S★ w/Ivy |

*Note on Jon: R1N w/Richard, R6N w/Trevor, R8N w/Joe = 3 games. The R5N listed for Jon above in an earlier draft was wrong — Arman+Richard play R5N. Jon does NOT play R5N.*

---

#### No-repeat-partner check — men's doubles only

Every pairing that appears in a men's doubles match:

| Match | Round | Court | Pair | Both players' other men's doubles partners |
|-------|-------|-------|------|--------------------------------------------|
| m1  | R1 | S | Arman + Rhon | Arman also plays Joe(R2), Pierre(R3), Richard(R5) · Rhon also plays Jay(R2), Richard(R8) |
| m2  | R1 | N | Jon + Richard | Jon also plays Trevor(R6), Joe(R8) · Richard also plays Jay(R3), Arman(R5), Rhon(R8) |
| m3  | R2 | S | Arman + Joe | — (Arman-Joe never repeat) |
| m4  | R2 | N | Jay + Rhon | — (Jay-Rhon never repeat) |
| m5  | R3 | S | Jay + Richard | — |
| m6  | R3 | N | Arman + Pierre | — (Pierre's only men's game) |
| m10 | R5 | N | Arman + Richard | — |
| m11 | R6 | S | Jay + Joe | — |
| m12 | R6 | N | Trevor + Jon | — (Trevor's only men's game) |
| m15 | R8 | S | Richard + Rhon | — |
| m16 | R8 | N | Jon + Joe | — |

Every pair appears exactly once. No man repeats a men's doubles partner. ✅

---

#### No same-round conflict check

Each round has two simultaneous courts. No Blue Crew player can appear on both. Verified:

| Round | South Court (BC players) | North Court (BC players) | Any overlap? |
|-------|--------------------------|--------------------------|--------------|
| R1 | Arman, Rhon | Jon, Richard | ✅ None |
| R2 | Arman, Joe | Jay, Rhon | ✅ None |
| R3 | Jay, Richard | Arman, Pierre | ✅ None |
| R4 | Marv, Carmela ★ | Trevor, Alexis ★ | ✅ None |
| R5 | Marv, Carmela ★ | Arman, Richard | ✅ None (Marv+Carmela separate court from men's) |
| R6 | Jay, Joe | Trevor, Jon | ✅ None |
| R7 | Trevor, Alexis ★ | Pierre, Ivy ★ | ✅ None |
| R8 | Richard, Rhon | Jon, Joe | ✅ None |
| R9 | Pierre, Ivy ★ | Marv, Carmela ★ | ✅ None |

---

### 11.2 Why certain game counts are unavoidable

#### Why one woman must play 3 games

There are 7 mixed doubles slots. Blue Crew has 3 women. The only way to distribute 7 across 3 people is (3,2,2) — you cannot fit 7 into three groups where everyone plays ≤2. Proof:

```
Maximum games if all women play ≤2:  3 women × 2 games = 6 total
But we have 7 mixed slots.          7 > 6 — impossible.
```

So at least one woman *must* play 3 games. The only choice is *which* couple gets the third slot — the script randomly picks one each run (or you can force it with `FORCED_TRIPLE`).

Comparison with Hill Street Blues (their actual schedule):
```
Hill Street Blues women:  Suzan=1 game, Rachel=3 games, Molly=3 games  → distribution (1,3,3)
Blue Crew women:          Alexis=2,     Carmela=3,      Ivy=2          → distribution (2,3,2)
```
Blue Crew's (3,2,2) is more equitable than HSB's (3,3,1).

#### Why two non-couple men must play 4 games

There are 11 men's doubles matches × 2 players per side = **22 men's doubles player-slots** to fill.

The three couple men contribute to men's doubles only when they're not playing mixed:
```
Marv:   3 mixed → 0 men's doubles games
Trevor: 2 mixed → 1 men's doubles game
Pierre: 2 mixed → 1 men's doubles game
Couple men subtotal: 0 + 1 + 1 = 2 men's doubles player-slots
```

That leaves **22 − 2 = 20 men's doubles player-slots** for the 6 non-couple men (Jay, Arman, Jon, Richard, Rhon, Joe).

```
20 slots ÷ 6 men = 3 remainder 2
→ 4 men play 3 games, 2 men play 4 games  (unavoidable)
```

The script randomly picks which 2 men play 4 (or you can force it with `FORCED_QUAD_MEN`). In the current schedule: **Arman and Richard** each play 4 games.

#### What changes if the triple-game couple changes

The triple-game couple controls the balance between men's doubles and mixed for the couple men:

| Which couple gets 3 mixed | Marv's men's | Trevor's men's | Pierre's men's |
|---------------------------|-------------|---------------|---------------|
| Marv+Carmela (current) | **0** men's | 1 men's | 1 men's |
| Trevor+Alexis | 1 men's | **0** men's | 1 men's |
| Pierre+Ivy | 1 men's | 1 men's | **0** men's |

In all cases, the total couple-men contribution to men's doubles is always 2, so the "2 non-couple men play 4" conclusion never changes — only which non-couple men are affected changes.

---

### 11.3 How the algorithm works (step by step)

The script `backend/generate_pairings.py` runs these steps in order:

#### Step 1 — Pick triple-game couple
Randomly select which of the 3 couples plays 3 mixed games. The other two play 2 each. Controlled by `FORCED_TRIPLE` (set to `0`, `1`, or `2` to pin it; `None` for random).

#### Step 2 — Assign couples to mixed slots (backtracking)
The 7 mixed slots are: R4S, R4N, R5S, R7S, R7N, R9S, R9N.

A critical constraint: **no couple can be assigned to two courts of the same round** (they can't physically be in two places at once). The rounds with two mixed courts are R4 (both courts mixed), R7 (both), and R9 (both). So R4S and R4N must have *different* couples; same for R7 and R9. R5 only has one mixed court (South), so no conflict there.

The algorithm uses backtracking — it places couples into slots one by one, and if it reaches a state where a couple would need to be on two courts of the same round, it backtracks and tries a different assignment.

Example of what's prevented:
```
❌ BAD (previous buggy run): Marv+Carmela in both R7S and R7N — simultaneous conflict!
✅ GOOD (current): Marv+Carmela in R4S, R5S, R9N — all different rounds
```

#### Step 3 — Calculate each man's men's doubles game count
- **Couple men**: `men's games = 3 − (mixed games they play)`
  - Marv plays 3 mixed → 0 men's
  - Trevor plays 2 mixed → 1 men's
  - Pierre plays 2 mixed → 1 men's
- **Non-couple men**: 4 of them play 3, 2 play 4 (from the math above). Which 2 play 4 is random (controlled by `FORCED_QUAD_MEN`).

#### Step 4 — Generate valid men's doubles pairs (backtracking)
Build a pool of player-slots based on each man's count:
```
Arman × 4, Richard × 4, Jay × 3, Jon × 3, Rhon × 3, Joe × 3, Trevor × 1, Pierre × 1
```
Then use backtracking to pair them up with **no repeated partners**. The algorithm always picks the player with the most remaining games first (most-constrained-first heuristic), which avoids dead ends.

Any pairs in `PINNED_PAIRS` are included verbatim and their counts are pre-subtracted before backtracking fills the rest.

#### Step 5 — Assign pairs to rounds (backtracking)
Place the 11 generated pairs into the 11 men's doubles slots. Two constraints:
- **No player in two courts of the same round**: if Arman is already on the South court in Round 2, he can't also be on the North court in Round 2.
- **No couple man in his mixed round**: if Trevor plays mixed in R4 and R7, his one men's doubles game must land in R1, R2, R3, R5, R6, R8, or R9 — not R4 or R7.

If a pair can't be placed without violating those constraints, the algorithm backtracks and tries a different pair for that slot.

#### Step 6 — Validate
Before saving the xlsx, the script checks:
- No player appears in two slots of the same round
- No man repeats a men's doubles partner

If any violation is found, the script exits with an error and prints which constraint was broken.

---

### 11.4 How to tweak the schedule

Open `backend/generate_pairings.py` — the configuration block is at the very top, clearly marked:

```python
RANDOM_SEED     = None    # Set to integer for reproducible draw (e.g. 42)
FORCED_TRIPLE   = None    # Which couple gets 3 mixed: 0=Trevor/Alexis, 1=Marv/Carmela, 2=Pierre/Ivy
FORCED_QUAD_MEN = None    # Which 2 non-couple men play 4 games: e.g. ['b4','b7']
PINNED_PAIRS    = []      # Force specific men's doubles pairings: e.g. [('b2','b5')]
```

#### Scenario A — "I want Alexis to play 3 mixed games instead of Carmela"

```python
FORCED_TRIPLE = 0   # 0 = Trevor/Alexis couple
```

#### Scenario B — "I want Jay and Jon to always play together in men's doubles"

```python
PINNED_PAIRS = [('b2', 'b5')]   # b2=Jay, b5=Jon
```

The algorithm will include Jay+Jon in some round and build the rest of the schedule around it.

#### Scenario C — "I want Arman and Jon to be the two who play 4 games"

```python
FORCED_QUAD_MEN = ['b4', 'b11']   # b4=Arman, b11=Joe  -- wait, Jon is b5
FORCED_QUAD_MEN = ['b4', 'b5']    # b4=Arman, b5=Jon
```

#### Scenario D — "I want the exact same random draw every time"

```python
RANDOM_SEED = 42    # any integer; same seed = same output
```

#### Scenario E — "I want to completely hand-craft the schedule"

Don't run the script. Edit `src/data/mockData.js` directly, changing the `teamBP1` and `teamBP2` values (which are player IDs like `b2`, `b5`, etc.) for each match.  
Also edit the Google Sheets Schedule tab columns G and H.

Player ID reference:
```
b1=Alexis  b2=Jay    b3=Marv    b4=Arman  b5=Jon   b6=Trevor
b7=Richard b8=Rhon   b9=Carmela b10=Ivy   b11=Joe  b12=Pierre
```

#### Scenario F — "I want to generate and review several random draws before picking one"

```python
RANDOM_SEED = 1   # run, review
RANDOM_SEED = 2   # run, review
RANDOM_SEED = 3   # run, review
```

Each produces a completely different valid schedule. When you pick one you like, leave that seed set and the xlsx stays consistent.

---

### 11.5 What to do with the output

1. Open `docs/BlueCrew_Pairings.xlsx` — review the **Full Schedule** tab to see both teams side by side
2. Check the **Blue Crew Matrix** tab — the 12×12 grid shows every pairing at a glance (green=men's, yellow=mixed)
3. If the schedule looks good, copy Blue Crew's player IDs into the Google Sheets **Schedule** tab (columns G and H for each of m1–m18)
4. Alternatively, just use the schedule as a printed reference card on tournament day

---

### 11.6 Future iterations

**Iteration 2 (planned):** Women play 1 game with their preferred partner and 1 game with a random partner. The current iteration locks all mixed doubles to the same fixed couple. To implement: expand the mixed slot assignment to allow different men for a given woman across her games.

---

## 12. Pairing Schedule — Pre-Assignment Strategy

> **Decision: pre-assign ALL pairings before tournament day.** Do not leave partner assignments to be figured out on the court.

### Why this matters

With 9 men per team and 3 playing per round, there are C(9,2) = 36 possible pairs but only 11 men's doubles slots — so the schedule is tight. The no-repeat-partner constraint makes it non-trivial to figure out on the fly. In 60 seconds between rounds, with 24 people waiting, it's easy to accidentally repeat a pairing.

A printed card is the answer. With pre-assigned pairings, the captain reads off names rather than doing live combinatorics while also tracking scores.

### Men's doubles game structure

| Player type | Mixed games | Men's doubles | Total games |
|-------------|-------------|---------------|-------------|
| Couple man who draws 3 mixed | 3 | 0 | **3** |
| Couple man who draws 2 mixed | 2 | 1 | **3** |
| Non-couple man (most) | 0 | 3 | **3** |
| Non-couple man (2 of 6) | 0 | 4 | **4** |

The 4-game men are unavoidable — see Section 11.2 for the math.

### Why couples in mixed doubles is the right call for this iteration

1. Removes scheduling complexity: each woman's game slots are entirely determined by her couple's assignment — no need to think about who she'll play with
2. Socially natural: couples want to play together, and this format guarantees it
3. The fairness tradeoff (one woman plays 3 games instead of 2) is the minimum possible inequality given 7 mixed slots and 3 couples

---

## 13. Known Issues / Notes

- The `node_modules/` deprecation warning about Node.js 20 in GitHub Actions is cosmetic — the build succeeds. Will auto-resolve when GitHub upgrades runner defaults.
- Source image files (`12511.jpg`, `athenaeum_header_logo.png`, `athenaeum_pickle_courts.png`, `IMG_2787.PNG`) and docx files have been moved to `docs/`. They are not served by the app — the app uses compressed copies in `src/assets/`.
- The `.venv/` Python virtual environment is gitignored. It contains `openpyxl`, `python-docx`, and `Pillow`, used during development to read the `.docx` file, compress images, and generate xlsx files.
- `backend/generate_pairings.py` uses `random.seed()` with no argument by default, so each run produces a different pairing draw. Set `RANDOM_SEED` at the top of the script to an integer to get a reproducible draw. Re-run to get a new randomized schedule; `docs/BlueCrew_Pairings.xlsx` will be overwritten.
- The first generated pairings (commit `f4aadbc`) had a scheduling bug: the same player appeared on two courts in the same round simultaneously (Jay in R2S+R2N, Arman in R8S+R8N, Marv+Carmela in R7S+R7N). Fixed in the next commit by adding round-conflict backtracking to the assignment step.
