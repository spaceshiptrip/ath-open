# ATH Open Pickleball Tournament — Requirements, Design & Deployment Guide

## Overview

A full-stack web application for the **ATH Open Pickleball Team Round Robin** held at The Athenaeum.  
Frontend: **Vite + React + Tailwind CSS** | Backend: **Google Sheets + Apps Script (code.gs)**  
Hosting: **GitHub Pages** via GitHub Actions CI/CD.

---

## Tournament Rules (from official document)

| Rule | Detail |
|------|--------|
| Location | The Athenaeum |
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
| Mix Doubles rounds | Rounds 3 (S+N), 4 (S), 6 (S+N) |
| Teams | Team A (Captain: Suzan) vs Team B (Captain: Cora) |
| Courts | South (S) and North (N) |

---

## Architecture

```
┌─────────────────────────────┐      HTTPS (GET)     ┌──────────────────────────┐
│   React SPA (GitHub Pages)  │ ──────────────────►  │  Google Apps Script      │
│   Vite + Tailwind           │                       │  Web App (code.gs)       │
│   github.io/ath-open        │ ◄──────────────────  │  deployed from Sheet     │
└─────────────────────────────┘      JSON response    └──────────┬───────────────┘
                                                                  │
                                                                  ▼
                                                       ┌──────────────────────────┐
                                                       │  Google Spreadsheet      │
                                                       │  Players | Schedule      │
                                                       └──────────────────────────┘
```

**Key design decisions:**
- Uses `HashRouter` so GitHub Pages doesn't 404 on direct deep-links.
- All Sheets API calls are HTTP GET (Apps Script handles GET CORS automatically; POST requires extra setup).
- `VITE_SHEETS_API_URL` env var switches between live Sheets and in-app mock data.
- Mock data (`src/data/mockData.js`) enables full local development without Sheets.

---

## Google Sheets Structure

### Required Tabs (created automatically by `initSheets()` in code.gs)

#### `Players` sheet
| Column | Field | Description |
|--------|-------|-------------|
| A | id | Auto-generated (e.g. `p1234567890`) |
| B | firstName | Player's first name |
| C | lastName | Player's last name |
| D | team | `A` or `B` |
| E | gender | `M` or `F` |
| F | isCaptain | `TRUE` or `FALSE` |
| G | headshotUrl | Direct image URL (optional) |
| H | phone | Phone number (optional) |
| I | email | Email address (optional) |
| J | timestamp | ISO timestamp of registration |

#### `Schedule` sheet
| Column | Field | Description |
|--------|-------|-------------|
| A | id | Match ID (e.g. `m1`–`m16`) |
| B | round | Round number (1–8) |
| C | court | `S` (South) or `N` (North) |
| D | isMix | `TRUE` if Mixed Doubles |
| E | teamAP1 | Team A — Player 1 ID (optional pairing) |
| F | teamAP2 | Team A — Player 2 ID |
| G | teamBP1 | Team B — Player 1 ID |
| H | teamBP2 | Team B — Player 2 ID |
| I | winner | `A`, `B`, or empty |

**Pre-populated match slots** (isMix=TRUE rows highlighted in yellow automatically):

| Match | Round | Court | Mix? |
|-------|-------|-------|------|
| m1  | 1 | S | No  |
| m2  | 1 | N | No  |
| m3  | 2 | S | No  |
| m4  | 2 | N | No  |
| m5  | 3 | S | **Yes** |
| m6  | 3 | N | **Yes** |
| m7  | 4 | S | **Yes** |
| m8  | 4 | N | No  |
| m9  | 5 | S | No  |
| m10 | 5 | N | No  |
| m11 | 6 | S | **Yes** |
| m12 | 6 | N | **Yes** |
| m13 | 7 | S | No  |
| m14 | 7 | N | No  |
| m15 | 8 | S | No  |
| m16 | 8 | N | No  |

---

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/#/` | Home | Hero banner, quick stats, CTA buttons, rules preview |
| `/#/register` | Register | Player sign-up form |
| `/#/teams` | Teams | Team A & B rosters with player cards and headshots |
| `/#/schedule` | Schedule | Full match schedule, 8 rounds × 2 courts |
| `/#/scores` | Scores | Live standings + score entry (toggle edit mode) |
| `/#/rules` | Rules | Full tournament rules |

---

## Apps Script API

All requests are HTTP GET to `VITE_SHEETS_API_URL?action=<action>&params`.

| Action | Params | Description |
|--------|--------|-------------|
| `getPlayers` | — | Returns all players array |
| `registerPlayer` | firstName, lastName, team, gender, headshotUrl, phone, email | Appends to Players sheet |
| `getMatches` | — | Returns all 16 match slots |
| `updateScore` | matchId, winner (`A`\|`B`\|``) | Sets winner on a match |
| `getStandings` | — | Returns `{ A: winsA, B: winsB }` |
| `initSheets` | — | Creates tabs and pre-populates Schedule (run once) |

---

## Project File Structure

```
ath-open/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD — build + deploy to GitHub Pages
├── backend/
│   └── code.gs                 # Google Apps Script (paste into Script Editor)
├── public/
│   └── assets/                 # Static assets (team logos, etc.)
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Sticky nav with mobile hamburger
│   │   ├── Footer.jsx          # Simple footer
│   │   ├── PlayerCard.jsx      # Player card with headshot/initials avatar
│   │   ├── MatchCard.jsx       # Match display + win entry buttons
│   │   └── Standings.jsx       # Team A vs Team B wins summary
│   ├── data/
│   │   └── mockData.js         # Sample players + matches for local dev
│   ├── hooks/
│   │   └── useApi.js           # Generic hook wrapping api.js methods
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Register.jsx        # Player registration form
│   │   ├── Teams.jsx           # Team rosters
│   │   ├── Schedule.jsx        # Match schedule (read-only)
│   │   ├── Scores.jsx          # Live scores + score entry
│   │   └── Rules.jsx           # Tournament rules
│   ├── services/
│   │   └── api.js              # API calls (live Sheets or mock fallback)
│   ├── App.jsx                 # Router + layout
│   ├── config.js               # Tournament constants + env vars
│   ├── index.css               # Tailwind directives + component classes
│   └── main.jsx                # React entry point
├── .env.example                # Env var template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Local Development Setup

### Step 1 — Clone and install

```bash
git clone https://github.com/spaceshiptrip/ath-open.git
cd ath-open
npm install
```

### Step 2 — Run locally (mock data — no Sheets needed)

```bash
npm run dev
# → http://localhost:5173/ath-open/
```

The app loads with 16 mock players and all 16 scheduled matches. The Scores page has a
"Demo mode" badge and you can test score entry locally (state is in-memory only).

### Step 3 — Connect to Google Sheets (optional for local)

```bash
cp .env.example .env
# Edit .env and paste your Web App URL:
# VITE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
npm run dev
```

---

## Google Sheets Setup (one-time)

### A. Create the Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it **ATH Open Pickleball**.
3. Copy the Spreadsheet ID from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`<THIS_IS_YOUR_ID>`**`/edit`

### B. Create the Apps Script

1. In the spreadsheet, go to **Extensions → Apps Script**.
2. Delete the default `Code.gs` content.
3. Paste the entire contents of `backend/code.gs`.
4. At the top of the file, paste your Spreadsheet ID into `const SS_ID = 'YOUR_ID_HERE';`.
5. Click **Save** (Ctrl/Cmd+S).

### C. Initialize the sheets

1. In the Apps Script editor, select `initSheets` from the function dropdown.
2. Click **Run**.
3. Grant permissions when prompted.
4. You should now see **Players** and **Schedule** tabs in your spreadsheet.
5. The Schedule tab will be pre-populated with the 16 match slots.

### D. Deploy as Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Settings:
   - **Description**: ATH Open API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**.
5. Copy the **Web App URL** (ends in `/exec`).

### E. Add player pairings to the Schedule

1. Open the **Schedule** sheet.
2. Fill in columns E–H (`teamAP1`, `teamAP2`, `teamBP1`, `teamBP2`) with Player IDs from the Players sheet once players register.
3. Alternatively, the captain can fill in pairings before each round.

---

## Deployment to GitHub Pages

### Step 1 — Enable GitHub Pages

1. Go to your repo on GitHub: `github.com/spaceshiptrip/ath-open`
2. **Settings → Pages**
3. Under "Build and deployment", select **Source: GitHub Actions**
4. Save.

### Step 2 — Add the secret

1. **Settings → Secrets and variables → Actions → New repository secret**
2. Name: `VITE_SHEETS_API_URL`
3. Value: your Web App URL from step D above
4. Click **Add secret**.

### Step 3 — Push and deploy

```bash
git add .
git commit -m "Initial ATH Open app"
git push origin main
```

GitHub Actions will run automatically. Watch progress at:  
`github.com/spaceshiptrip/ath-open/actions`

Your site will be live at:  
`https://spaceshiptrip.github.io/ath-open/`

### Step 4 — Redeploy after Apps Script changes

Whenever you redeploy `code.gs`, you'll get a **new URL** (new script version).  
Update the GitHub secret (`VITE_SHEETS_API_URL`) and push any commit to trigger a rebuild.  
To avoid URL changes, use **Manage deployments → edit the existing deployment** instead of creating a new one.

---

## Team Logos / Headshots

- Headshots: players provide a direct image URL during registration (Google Drive, Dropbox, or any public image host).
- Team logos: place image files in `public/assets/` (e.g. `public/assets/team-a-logo.png`) and reference them as `/ath-open/assets/team-a-logo.png`.
- To add logos to the Teams page, import the image in `src/pages/Teams.jsx` and render it in the `TeamSection` header.

---

## Work Remaining / TODO

- [ ] Assign actual player pairings in the Schedule sheet once players register
- [ ] Add team logo images to `public/assets/` and wire them into the Teams page
- [ ] Add headshot upload support (currently URL-only; could add Google Drive picker)
- [ ] Add captain login/PIN so only captains can enter scores (currently anyone who clicks "Enter Scores" can edit)
- [ ] Add push/refresh so score updates appear live without page reload (polling or websocket)
- [ ] Add player pairing editor UI so captains can set pairings without editing the spreadsheet directly
- [ ] Print-friendly schedule/scorecard page for courtside use

---

## Color Palette

| Token | Value | Use |
|-------|-------|-----|
| `pickle-500` | `#2d7d4f` | Primary green (buttons, accents) |
| `pickle-900` | `#0f2b1c` | Header/footer background |
| `ball` | `#f5c518` | Yellow accent (ball color) |
| `blue-600` | Tailwind | Team A |
| `red-600` | Tailwind | Team B |
