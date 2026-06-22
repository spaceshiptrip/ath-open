"""
Generates ATH_Open_Sheets_Template.xlsx — run from the repo root with:
    .venv/bin/python3 backend/generate_template.py

Requires openpyxl (already in .venv):
    .venv/bin/pip install openpyxl
"""

from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = Workbook()

# ── colours ───────────────────────────────────────────────────────────────────
GREEN  = PatternFill("solid", fgColor="1d4f35")
YELLOW = PatternFill("solid", fgColor="f5c518")
RED    = PatternFill("solid", fgColor="FFDCE0")
BLUE   = PatternFill("solid", fgColor="DCE8FF")
GREY   = PatternFill("solid", fgColor="F2F2F2")
WHITE_FONT = Font(color="FFFFFF", bold=True)
BOLD       = Font(bold=True)

thin   = Side(style="thin", color="CCCCCC")
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def header_row(ws, headers, fill=GREEN, font=WHITE_FONT):
    for col, h in enumerate(headers, 1):
        c = ws.cell(row=1, column=col, value=h)
        c.fill = fill
        c.font = font
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = border


# ── 1. Players tab ────────────────────────────────────────────────────────────
ws_p = wb.active
ws_p.title = "Players"
ws_p.row_dimensions[1].height = 28

player_headers = [
    "id", "firstName", "lastName", "team", "gender",
    "isCaptain", "headshotUrl", "phone", "email", "timestamp", "partnerId",
]
header_row(ws_p, player_headers)

col_widths = [18, 12, 14, 8, 8, 10, 36, 16, 26, 26, 18]
for i, w in enumerate(col_widths, 1):
    ws_p.column_dimensions[get_column_letter(i)].width = w

# notes row (row 2)
notes = [
    "auto-generated", "required", "required", "A or B", "M or F",
    "TRUE/FALSE", "optional URL", "optional", "optional",
    "auto-generated", "partner's id or blank",
]
for col, note in enumerate(notes, 1):
    c = ws_p.cell(row=2, column=col, value=note)
    c.fill = GREY
    c.font = Font(italic=True, color="888888", size=9)
    c.alignment = Alignment(horizontal="center")
    c.border = border

# Example players — Team A (12: 3F + 9M)
# Couples: a1↔a8, a9↔a11, a10↔a12
team_a = [
    ["a1",  "Suzan",  "King",    "A", "F", "TRUE",  "", "(555)100-0001", "suzan@example.com",  "", "a8"],
    ["a9",  "Rachel", "Park",    "A", "F", "FALSE", "", "(555)100-0009", "rachel@example.com", "", "a11"],
    ["a10", "Lisa",   "Torres",  "A", "F", "FALSE", "", "(555)100-0010", "lisa@example.com",   "", "a12"],
    ["a2",  "Marcus", "Rivera",  "A", "M", "FALSE", "", "(555)100-0002", "marcus@example.com", "", ""],
    ["a3",  "Derek",  "Pham",    "A", "M", "FALSE", "", "(555)100-0003", "derek@example.com",  "", ""],
    ["a4",  "James",  "Okafor",  "A", "M", "FALSE", "", "(555)100-0004", "james@example.com",  "", ""],
    ["a5",  "Luis",   "Chen",    "A", "M", "FALSE", "", "(555)100-0005", "luis@example.com",   "", ""],
    ["a6",  "Tyler",  "Brooks",  "A", "M", "FALSE", "", "(555)100-0006", "tyler@example.com",  "", ""],
    ["a7",  "Kevin",  "Marsh",   "A", "M", "FALSE", "", "(555)100-0007", "kevin@example.com",  "", ""],
    ["a8",  "Andre",  "Santos",  "A", "M", "FALSE", "", "(555)100-0008", "andre@example.com",  "", "a1"],
    ["a11", "Ryan",   "Park",    "A", "M", "FALSE", "", "(555)100-0011", "ryan@example.com",   "", "a9"],
    ["a12", "Brian",  "Torres",  "A", "M", "FALSE", "", "(555)100-0012", "brian@example.com",  "", "a10"],
]

# Blue Crew (JPL Team) — Team B (12: 3F + 9M)
# Couples: b1(Alexis)↔b6(Trevor), b9(Carmela)↔b3(Marv), b10(Ivy)↔b12(Pierre)
team_b = [
    ["b1",  "Alexis",  "", "B", "F", "TRUE",  "", "", "", "", "b6"],
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
    fill = RED if row[3] == "A" else BLUE
    for col, val in enumerate(row, 1):
        c = ws_p.cell(row=row_idx, column=col, value=val)
        c.fill = fill
        c.alignment = Alignment(horizontal="left", vertical="center")
        c.border = border

ws_p.freeze_panes = "A2"


# ── 2. Schedule tab ───────────────────────────────────────────────────────────
ws_s = wb.create_sheet("Schedule")
ws_s.row_dimensions[1].height = 28

sched_headers = [
    "id", "round", "court", "isMix",
    "teamAP1", "teamAP2", "teamBP1", "teamBP2", "winner",
]
header_row(ws_s, sched_headers)

sched_widths = [8, 8, 8, 8, 14, 14, 14, 14, 10]
for i, w in enumerate(sched_widths, 1):
    ws_s.column_dimensions[get_column_letter(i)].width = w

matches = [
    # Round 1 — Men's Doubles
    ["m1",  1, "S", "FALSE", "", "", "", "", ""],
    ["m2",  1, "N", "FALSE", "", "", "", "", ""],
    # Round 2 — Men's Doubles
    ["m3",  2, "S", "FALSE", "", "", "", "", ""],
    ["m4",  2, "N", "FALSE", "", "", "", "", ""],
    # Round 3 — Men's Doubles
    ["m5",  3, "S", "FALSE", "", "", "", "", ""],
    ["m6",  3, "N", "FALSE", "", "", "", "", ""],
    # Round 4 — Mixed Doubles ★ both courts
    ["m7",  4, "S", "TRUE",  "", "", "", "", ""],
    ["m8",  4, "N", "TRUE",  "", "", "", "", ""],
    # Round 5 — Mixed South ★, Men's North
    ["m9",  5, "S", "TRUE",  "", "", "", "", ""],
    ["m10", 5, "N", "FALSE", "", "", "", "", ""],
    # Round 6 — Men's Doubles
    ["m11", 6, "S", "FALSE", "", "", "", "", ""],
    ["m12", 6, "N", "FALSE", "", "", "", "", ""],
    # Round 7 — Mixed Doubles ★ both courts
    ["m13", 7, "S", "TRUE",  "", "", "", "", ""],
    ["m14", 7, "N", "TRUE",  "", "", "", "", ""],
    # Round 8 — Men's Doubles
    ["m15", 8, "S", "FALSE", "", "", "", "", ""],
    ["m16", 8, "N", "FALSE", "", "", "", "", ""],
    # Round 9 — Mixed Doubles ★ both courts
    ["m17", 9, "S", "TRUE",  "", "", "", "", ""],
    ["m18", 9, "N", "TRUE",  "", "", "", "", ""],
]

for row_idx, row in enumerate(matches, 2):
    fill = YELLOW if row[3] == "TRUE" else GREY
    for col, val in enumerate(row, 1):
        c = ws_s.cell(row=row_idx, column=col, value=val)
        c.fill = fill
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = border

ws_s.freeze_panes = "A2"


# ── 3. How To Use tab ─────────────────────────────────────────────────────────
ws_h = wb.create_sheet("How To Use")
ws_h.column_dimensions["A"].width = 24
ws_h.column_dimensions["B"].width = 70

section_fill = PatternFill("solid", fgColor="2d7d4f")

instructions = [
    ("PLAYERS TAB", ""),
    ("id",               "Leave blank — auto-generated by the registration form (format: p<timestamp>)"),
    ("firstName / lastName", "Player's name"),
    ("team",             "A  or  B"),
    ("gender",           "M  or  F"),
    ("isCaptain",        "TRUE for one player per team; FALSE for everyone else"),
    ("headshotUrl",      "Optional: direct link to a photo (JPEG or PNG)"),
    ("phone / email",    "Optional contact info"),
    ("timestamp",        "Leave blank — auto-filled when player registers via the web form"),
    ("partnerId",        "The id of this player's mixed doubles partner (e.g. a8). Leave blank if no partner playing."),
    ("", ""),
    ("SCHEDULE TAB", ""),
    ("id",               "Match IDs m1–m16 are pre-filled. Do not change."),
    ("round",            "Round number 1–8. Pre-filled."),
    ("court",            "S = South Court, N = North Court. Pre-filled."),
    ("isMix",            "TRUE = Mixed Doubles ★ (yellow rows). Pre-filled."),
    ("teamAP1 / teamAP2", "Team A player IDs for this match — copy from Players tab column A"),
    ("teamBP1 / teamBP2", "Team B (Blue Crew) player IDs for this match"),
    ("winner",           "Enter A or B after the match is played. Or use the app Scores page."),
    ("", ""),
    ("COUPLES (Mixed Doubles)", ""),
    ("How it works",     "Players with a partnerId play together in all Mixed Doubles (★) matches."),
    ("Captain",          "Captain plays 1 mixed game (round 4 South). Her partner: 1 mixed + 2 men's."),
    ("Non-captain women", "Each plays 2 mixed games (rounds 3 and 6). Their partners: 2 mixed + 1 men's."),
    ("", ""),
    ("MEN'S DOUBLES", ""),
    ("Pairing rule",     "Each man plays exactly 3 games, never with the same partner twice."),
    ("Seeding",          "TBD — random draw or captain's choice. Fill teamAP1/AP2/BP1/BP2 before tournament day."),
]

for row_idx, (key, val) in enumerate(instructions, 1):
    ck = ws_h.cell(row=row_idx, column=1, value=key)
    cv = ws_h.cell(row=row_idx, column=2, value=val)
    if val == "" and key:
        ck.fill = section_fill
        ck.font = Font(color="FFFFFF", bold=True)
        ws_h.merge_cells(f"A{row_idx}:B{row_idx}")
    else:
        ck.font = Font(bold=True)
    cv.alignment = Alignment(wrap_text=True, vertical="center")
    ws_h.row_dimensions[row_idx].height = 20


wb.save("backend/ATH_Open_Sheets_Template.xlsx")
print("Saved: backend/ATH_Open_Sheets_Template.xlsx")
