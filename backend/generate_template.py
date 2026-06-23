"""
Generates backend/ATH_Open_Sheets_Template.xlsx — run from the repo root with:
    .venv/bin/python3 backend/generate_template.py

The output matches the current hardcoded mock data exactly (same player IDs,
same match pairings) so you can paste this directly into Google Sheets and
connect it with code.gs without any changes.

Requires openpyxl (already in .venv):
    .venv/bin/pip install openpyxl
"""

from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = Workbook()

# ── colours ───────────────────────────────────────────────────────────────────
GREEN   = PatternFill("solid", fgColor="1d4f35")
YELLOW  = PatternFill("solid", fgColor="f5c518")
RED     = PatternFill("solid", fgColor="FFDCE0")
BLUE    = PatternFill("solid", fgColor="DCE8FF")
PURPLE  = PatternFill("solid", fgColor="EDE7F6")
GREY    = PatternFill("solid", fgColor="F2F2F2")
WHITE_FONT = Font(color="FFFFFF", bold=True)
BOLD       = Font(bold=True)

thin   = Side(style="thin", color="CCCCCC")
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def hdr(ws, headers, fill=GREEN, font=WHITE_FONT):
    for col, h in enumerate(headers, 1):
        c = ws.cell(row=1, column=col, value=h)
        c.fill = fill; c.font = font
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = border


def cell(ws, row, col, val, fill=None, bold=False, align="left"):
    c = ws.cell(row=row, column=col, value=val)
    if fill: c.fill = fill
    c.font = Font(bold=bold)
    c.alignment = Alignment(horizontal=align, vertical="center")
    c.border = border
    return c


# ════════════════════════════════════════════════════════════════════════════════
# 1. Players tab — matches src/data/mockData.js exactly
# ════════════════════════════════════════════════════════════════════════════════
ws_p = wb.active
ws_p.title = "Players"
ws_p.row_dimensions[1].height = 28

player_headers = [
    "id", "firstName", "lastName", "team", "gender",
    "isCaptain", "headshotUrl", "phone", "email", "timestamp", "partnerId",
]
hdr(ws_p, player_headers)

col_widths = [14, 12, 10, 6, 8, 10, 36, 16, 28, 28, 12]
for i, w in enumerate(col_widths, 1):
    ws_p.column_dimensions[get_column_letter(i)].width = w

# Hill Street Blues (Team A) — 12 players: 3F + 9M. No fixed couples.
team_a = [
    # id       first     last  team gen  cap    headshot  phone  email  ts    partner
    ["a1",  "Suzan",   "",  "A", "F", "TRUE",  "", "", "", "", ""],
    ["a2",  "Rachel",  "",  "A", "F", "FALSE", "", "", "", "", ""],
    ["a3",  "Molly",   "",  "A", "F", "FALSE", "", "", "", "", ""],
    ["a4",  "Pierre",  "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a5",  "Jeff",    "E", "A", "M", "FALSE", "", "", "", "", ""],
    ["a6",  "Dro",     "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a7",  "Steve",   "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a8",  "Mich",    "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a9",  "Wilfred", "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a10", "Jeff",    "W", "A", "M", "FALSE", "", "", "", "", ""],
    ["a11", "Yu Fon",  "",  "A", "M", "FALSE", "", "", "", "", ""],
    ["a12", "Johnny",  "",  "A", "M", "FALSE", "", "", "", "", ""],
]

# Blue Crew (Team B / JPL Team) — 13 players: 4F + 9M
# Captain: Cora (b13) — plays 1 mixed game with Jay (R7S). No fixed partner.
# Fixed couples (play mixed together): Alexis↔Trevor, Carmela↔Marv, Ivy↔Pierre
team_b = [
    ["b13", "Cora",    "", "B", "F", "TRUE",  "", "", "", "", ""],
    ["b1",  "Alexis",  "", "B", "F", "FALSE", "", "", "", "", "b6"],
    ["b9",  "Carmela", "", "B", "F", "FALSE", "", "", "", "", "b3"],
    ["b10", "Ivy",     "", "B", "F", "FALSE", "", "", "", "", "b12"],
    ["b2",  "Jay",     "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b3",  "Marv",    "", "B", "M", "FALSE", "", "", "", "", "b9"],
    ["b4",  "Arman",   "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b5",  "Jon",     "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b6",  "Trevor",  "", "B", "M", "FALSE", "", "", "", "", "b1"],
    ["b7",  "Richard", "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b8",  "Rhon",    "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b11", "Joe",     "", "B", "M", "FALSE", "", "", "", "", ""],
    ["b12", "Pierre",  "", "B", "M", "FALSE", "", "", "", "", "b10"],
]

for row_idx, row in enumerate(team_a + team_b, 3):
    is_a = row[3] == "A"
    is_cap = row[5] == "TRUE"
    fill = PURPLE if is_cap and not is_a else (RED if is_a else BLUE)
    for col, val in enumerate(row, 1):
        c = ws_p.cell(row=row_idx, column=col, value=val)
        c.fill = fill
        c.alignment = Alignment(horizontal="left", vertical="center")
        c.border = border
    ws_p.row_dimensions[row_idx].height = 18

ws_p.freeze_panes = "A2"


# ════════════════════════════════════════════════════════════════════════════════
# 2. Schedule tab — matches mockData.js exactly, with actual pairings pre-filled
#    Columns: id, round, court, isMix, teamAP1, teamAP2, teamBP1, teamBP2, winner, scoreA, scoreB
# ════════════════════════════════════════════════════════════════════════════════
ws_s = wb.create_sheet("Schedule")
ws_s.row_dimensions[1].height = 28

sched_headers = [
    "id", "round", "court", "isMix",
    "teamAP1", "teamAP2", "teamBP1", "teamBP2",
    "winner", "scoreA", "scoreB",
]
hdr(ws_s, sched_headers)

sched_widths = [6, 7, 7, 8, 10, 10, 10, 10, 8, 8, 8]
for i, w in enumerate(sched_widths, 1):
    ws_s.column_dimensions[get_column_letter(i)].width = w

# Matches exactly matching src/data/mockData.js
# isMix=TRUE rows highlighted in yellow
matches = [
    # id     round court isMix  AP1   AP2   BP1   BP2   win  sA sB
    # R1 8:30 AM — Men's Doubles
    ["m1",  1,"S","FALSE","a4", "a5", "b6", "b8", "", "", ""],
    ["m2",  1,"N","FALSE","a6", "a7", "b7", "b11","", "", ""],
    # R2 8:50 AM — Men's Doubles
    ["m3",  2,"S","FALSE","a8", "a9", "b4", "b12","", "", ""],
    ["m4",  2,"N","FALSE","a10","a11","b3", "b5", "", "", ""],
    # R3 9:15 AM — Men's Doubles
    ["m5",  3,"S","FALSE","a7", "a10","b8", "b11","", "", ""],
    ["m6",  3,"N","FALSE","a6", "a12","b2", "b7", "", "", ""],
    # R4 9:40 AM — Mixed Doubles ★ both courts
    ["m7",  4,"S","TRUE", "a4", "a1", "b12","b10","", "", ""],
    ["m8",  4,"N","TRUE", "a5", "a2", "b3", "b9", "", "", ""],
    # R5 10:10 AM — Mixed South ★, Men's North
    ["m9",  5,"S","TRUE", "a5", "a3", "b6", "b1", "", "", ""],
    ["m10", 5,"N","FALSE","a12","a9", "b2", "b8", "", "", ""],
    # R6 10:30 AM — Men's Doubles
    ["m11", 6,"S","FALSE","a11","a7", "b4", "b7", "", "", ""],
    ["m12", 6,"N","FALSE","a4", "a8", "b5", "b11","", "", ""],
    # R7 11:00 AM — Mixed Doubles ★ both courts
    ["m13", 7,"S","TRUE", "a12","a2", "b2", "b13","", "", ""],
    ["m14", 7,"N","TRUE", "a8", "a3", "b12","b10","", "", ""],
    # R8 11:30 AM — Men's Doubles
    ["m15", 8,"S","FALSE","a10","a6", "b4", "b11","", "", ""],
    ["m16", 8,"N","FALSE","a11","a5", "b5", "b8", "", "", ""],
    # R9 — Mixed Doubles ★ both courts
    ["m17", 9,"S","TRUE", "a9", "a2", "b6", "b1", "", "", ""],
    ["m18", 9,"N","TRUE", "a4", "a3", "b3", "b9", "", "", ""],
]

for row_idx, row in enumerate(matches, 2):
    is_mix = row[3] == "TRUE"
    fill = YELLOW if is_mix else GREY
    for col, val in enumerate(row, 1):
        c = ws_s.cell(row=row_idx, column=col, value=val)
        c.fill = fill
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = border
    ws_s.row_dimensions[row_idx].height = 18

ws_s.freeze_panes = "A2"


# ════════════════════════════════════════════════════════════════════════════════
# 3. How To Use tab
# ════════════════════════════════════════════════════════════════════════════════
ws_h = wb.create_sheet("How To Use")
ws_h.column_dimensions["A"].width = 26
ws_h.column_dimensions["B"].width = 72

section_fill = PatternFill("solid", fgColor="2d7d4f")

instructions = [
    ("SETUP", ""),
    ("1. Run initSheets()",  "In the Apps Script editor, select initSheets from the function dropdown and Run. This creates the Players and Schedule tabs and pre-populates all 18 matches. Do this ONCE before the tournament."),
    ("2. Deploy as Web App", "Apps Script → Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Copy the /exec URL."),
    ("3. Set VITE_SHEETS_API_URL", "Paste the /exec URL into GitHub → Settings → Secrets → VITE_SHEETS_API_URL. Re-run the GitHub Actions workflow to rebuild."),
    ("", ""),
    ("PLAYERS TAB", ""),
    ("id",                "Pre-assigned (a1–a12 for HSB, b1–b13 for Blue Crew). Registration form auto-generates p<timestamp> for new players."),
    ("firstName / lastName", "Player's name. lastName can be blank (most players). Set lastName for disambiguation: Jeff E / Jeff W."),
    ("team",              "A (Hill Street Blues) or B (Blue Crew / JPL Team)"),
    ("gender",            "M or F"),
    ("isCaptain",         "TRUE for one player per team; FALSE for all others. Blue Crew captain = Cora (b13)."),
    ("headshotUrl",       "Optional: direct URL to a portrait photo (JPEG or PNG)"),
    ("partnerId",         "The id of this player's fixed mixed-doubles partner. Blank if no fixed partner. Examples: b6 for Alexis (her couple is Trevor), b13 for Cora (blank — Jay is not a fixed couple)."),
    ("phone / email",     "Optional. Not displayed on the site."),
    ("timestamp",         "Auto-filled when a player registers via the web form. Leave blank for pre-loaded players."),
    ("", ""),
    ("SCHEDULE TAB", ""),
    ("id",                "Match IDs m1–m18 are pre-filled. Do not change."),
    ("round / court",     "Pre-filled. Round 1–9, court S (South) or N (North)."),
    ("isMix",             "TRUE = Mixed Doubles ★. Pre-filled. Yellow rows."),
    ("teamAP1/AP2",       "Hill Street Blues player IDs for this match. Pre-filled with the locked HSB pairings from their docx."),
    ("teamBP1/BP2",       "Blue Crew player IDs for this match. Pre-filled with the generated pairings from generate_pairings.py."),
    ("winner",            "Enter A or B after the match is played. Or use the app Scores page — the captain presses A Wins / B Wins on their phone."),
    ("scoreA / scoreB",   "Optional numeric scores. Enter after the match, e.g. 11 and 9. The app shows these alongside the winner badge. The Scores page has numeric input fields in edit mode."),
    ("", ""),
    ("LIVE UPDATES", ""),
    ("How it works",      "Once VITE_SHEETS_API_URL is set, the app reads from this sheet on every page load. No rebuild or redeploy needed — edit this sheet and the website updates immediately."),
    ("Roster changes",    "Add, edit, or remove players in the Players tab. Changes appear on the Teams page within seconds."),
    ("Score entry",       "Enter winner (A/B) and optional scores in the Schedule tab. Changes appear on the Scores and Schedule pages immediately. Captains can also enter scores directly in the app."),
    ("", ""),
    ("PLAYER ID REFERENCE", ""),
    ("Hill Street Blues", "a1=Suzan  a2=Rachel  a3=Molly  a4=Pierre  a5=Jeff E  a6=Dro  a7=Steve  a8=Mich  a9=Wilfred  a10=Jeff W  a11=Yu Fon  a12=Johnny"),
    ("Blue Crew",         "b13=Cora(C)  b1=Alexis  b9=Carmela  b10=Ivy  b2=Jay  b3=Marv  b4=Arman  b5=Jon  b6=Trevor  b7=Richard  b8=Rhon  b11=Joe  b12=Pierre"),
]

for row_idx, (key, val) in enumerate(instructions, 1):
    ck = ws_h.cell(row=row_idx, column=1, value=key)
    cv = ws_h.cell(row=row_idx, column=2, value=val)
    if val == "" and key:
        ck.fill = section_fill
        ck.font = Font(color="FFFFFF", bold=True)
        ws_h.merge_cells(f"A{row_idx}:B{row_idx}")
    else:
        ck.font = Font(bold=True if key else False)
    cv.alignment = Alignment(wrap_text=True, vertical="center")
    ws_h.row_dimensions[row_idx].height = 36 if val and len(val) > 60 else 20


wb.save("backend/ATH_Open_Sheets_Template.xlsx")
print("Saved: backend/ATH_Open_Sheets_Template.xlsx")
