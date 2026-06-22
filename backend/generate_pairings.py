"""
generate_pairings.py — Generate Blue Crew (Team B / JPL Team) pairings schedule.

Run from repo root:
    .venv/bin/python3 backend/generate_pairings.py

Outputs: docs/BlueCrew_Pairings.xlsx

Constraints:
  - Matches Hill Street Blues' 9-round structure (same rounds are mixed)
  - Mixed doubles: couples (partnerId pairs) always play together (this iteration)
  - Distribution (3,2,2): one couple plays 3 mixed games, two couples play 2
  - One woman plays 3 games, two play 2 — unavoidable with 7 mixed slots / 3 couples
  - Men: 7 play 3 games, 2 play 4 — unavoidable with 7 mixed slots (same as HSB)
  - No man repeats a partner across all games
  - Men's doubles pairings are randomised (no skill ranking)
"""

import random, sys
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ── Styles ────────────────────────────────────────────────────────────────────
G_DARK   = PatternFill("solid", fgColor="1d4f35")
G_MID    = PatternFill("solid", fgColor="2d7d4f")
G_LIGHT  = PatternFill("solid", fgColor="C8E6C9")
YELLOW   = PatternFill("solid", fgColor="FFF176")
GREY     = PatternFill("solid", fgColor="E0E0E0")
RED_L    = PatternFill("solid", fgColor="FFDCE0")
BLUE_L   = PatternFill("solid", fgColor="DCE8FF")
WHITE    = PatternFill("solid", fgColor="FFFFFF")
ORANGE_L = PatternFill("solid", fgColor="FFE0B2")

thin   = Side(style="thin", color="AAAAAA")
border = Border(left=thin, right=thin, top=thin, bottom=thin)

def cs(c, fill=None, bold=False, color="000000", align="center", wrap=False, size=10):
    if fill: c.fill = fill
    c.font = Font(bold=bold, color=color, size=size)
    c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=wrap)
    c.border = border

# ── Team A schedule (from docs/Team Round Robin Athenaeum.docx) ───────────────
A_SCHED = {
    (1,'S'): ('Pierre',  'Jeff E',   False),
    (1,'N'): ('Dro',     'Steve',    False),
    (2,'S'): ('Mich',    'Wilfred',  False),
    (2,'N'): ('Jeff W',  'Yu Fon',   False),
    (3,'S'): ('Steve',   'Jeff W',   False),
    (3,'N'): ('Dro',     'Johnny',   False),
    (4,'S'): ('Pierre',  'Suzan',    True),
    (4,'N'): ('Jeff E',  'Rachel',   True),
    (5,'S'): ('Jeff E',  'Molly',    True),
    (5,'N'): ('Johnny',  'Wilfred',  False),
    (6,'S'): ('Yu Fon',  'Steve',    False),
    (6,'N'): ('Pierre',  'Mich',     False),
    (7,'S'): ('Johnny',  'Rachel',   True),
    (7,'N'): ('Mich',    'Molly',    True),
    (8,'S'): ('Jeff W',  'Dro',      False),
    (8,'N'): ('Yu Fon',  'Jeff E',   False),
    (9,'S'): ('Wilfred', 'Rachel',   True),
    (9,'N'): ('Pierre',  'Molly',    True),
}

TIMES = {1:'8:30 am', 2:'8:50 am', 3:'9:15 am', 4:'9:40 am', 5:'10:10 am',
         6:'10:30 am', 7:'11:00 am', 8:'11:30 am', 9:'—'}

# ── Blue Crew roster ──────────────────────────────────────────────────────────
PB = {
    'b1':  {'name': 'Alexis',  'gender': 'F', 'partner': 'b6'},
    'b9':  {'name': 'Carmela', 'gender': 'F', 'partner': 'b3'},
    'b10': {'name': 'Ivy',     'gender': 'F', 'partner': 'b12'},
    'b2':  {'name': 'Jay',     'gender': 'M', 'partner': ''},
    'b3':  {'name': 'Marv',    'gender': 'M', 'partner': 'b9'},
    'b4':  {'name': 'Arman',   'gender': 'M', 'partner': ''},
    'b5':  {'name': 'Jon',     'gender': 'M', 'partner': ''},
    'b6':  {'name': 'Trevor',  'gender': 'M', 'partner': 'b1'},
    'b7':  {'name': 'Richard', 'gender': 'M', 'partner': ''},
    'b8':  {'name': 'Rhon',    'gender': 'M', 'partner': ''},
    'b11': {'name': 'Joe',     'gender': 'M', 'partner': ''},
    'b12': {'name': 'Pierre',  'gender': 'M', 'partner': 'b10'},
}

nm = lambda pid: PB[pid]['name']

COUPLES = [('b6','b1'), ('b3','b9'), ('b12','b10')]  # (man, woman)
COUPLE_MEN = {m for m,w in COUPLES}

MIXED_SLOTS = [(4,'S'),(4,'N'),(5,'S'),(7,'S'),(7,'N'),(9,'S'),(9,'N')]

# ── Assign couples to mixed slots ─────────────────────────────────────────────
random.seed()  # re-run for different random pairings

c_idx = list(range(3))
random.shuffle(c_idx)
mix_counts = [2, 2, 2]
mix_counts[c_idx[0]] = 3   # one couple gets 3

slot_list = []
for ci, cnt in enumerate(mix_counts):
    slot_list.extend([ci] * cnt)
random.shuffle(slot_list)

mixed_sched = {slot: COUPLES[ci] for slot, ci in zip(MIXED_SLOTS, slot_list)}

# ── Men's game counts ─────────────────────────────────────────────────────────
couple_mix_actual = Counter(slot_list)
mens_ct = {}
for ci, (mid, wid) in enumerate(COUPLES):
    mens_ct[mid] = 3 - couple_mix_actual[ci]   # 0 or 1

non_couple = [pid for pid, p in PB.items() if p['gender'] == 'M' and pid not in COUPLE_MEN]
total_needed = 22 - sum(mens_ct.values())   # should be 20
extras_needed = total_needed - 3 * len(non_couple)   # should be 2
extra_men = set(random.sample(non_couple, extras_needed))
for pid in non_couple:
    mens_ct[pid] = 4 if pid in extra_men else 3

# ── Generate men's doubles pairings ──────────────────────────────────────────
def make_pairings(counts):
    pool = []
    for pid, c in sorted(counts.items(), key=lambda x: -x[1]):
        if c > 0:
            pool.extend([pid] * c)
    used, result = set(), []
    def bt(rem):
        if not rem: return True
        freq = Counter(rem)
        p1 = freq.most_common(1)[0][0]
        others = list({p for p in rem if p != p1})
        random.shuffle(others)
        for p2 in others:
            key = (min(p1,p2), max(p1,p2))
            if key not in used:
                nr = list(rem); nr.remove(p1); nr.remove(p2)
                used.add(key); result.append((p1,p2))
                if bt(nr): return True
                result.pop(); used.remove(key)
        return False
    return result if bt(pool) else None

pairs = None
for _ in range(20):
    pairs = make_pairings(mens_ct)
    if pairs: break

if not pairs:
    print("ERROR: Could not generate valid pairings after 20 attempts.")
    sys.exit(1)

random.shuffle(pairs)

# ── Assign pairs to men's doubles slots ──────────────────────────────────────
mens_slots = [(r,c) for r in range(1,10) for c in ('S','N') if (r,c) not in set(MIXED_SLOTS)]
B_SCHED = {}
for slot, (p1, p2) in zip(mens_slots, pairs):
    B_SCHED[slot] = (nm(p1), nm(p2), False)
for slot, (mid, wid) in mixed_sched.items():
    B_SCHED[slot] = (nm(mid), nm(wid), True)

# ── Build partnership list for matrix ─────────────────────────────────────────
b_partnerships = []
for slot, (p1, p2, is_mix) in B_SCHED.items():
    b_partnerships.append((p1, p2, f"R{slot[0]}-{slot[1]}", is_mix))

pair_map_b = {}
for p1, p2, rnd, mix in b_partnerships:
    pair_map_b[(p1,p2)] = (rnd, mix)
    pair_map_b[(p2,p1)] = (rnd, mix)

# ── Print summary ──────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  BLUE CREW (JPL Team) — Pairings Generated")
print(f"{'='*60}")
print(f"\n  Mixed doubles distribution:")
for ci, (mid, wid) in enumerate(COUPLES):
    c = couple_mix_actual[ci]
    print(f"    {nm(mid)} & {nm(wid):8s} — {c} mixed game{'s' if c>1 else ''}")

print(f"\n  {'Player':12} {'Mix':4} {'Mens':6} {'Total':6} {'Note'}")
print(f"  {'-'*50}")

b_players_ordered = (
    [pid for pid,p in PB.items() if p['gender']=='F'] +
    [pid for pid,p in PB.items() if p['gender']=='M']
)

game_totals = {}
for pid in b_players_ordered:
    p = PB[pid]
    if p['gender'] == 'F':
        mix_c = sum(1 for slot,(mid,wid) in mixed_sched.items() if wid == pid)
        total = mix_c
    else:
        ci_list = [i for i,(m,w) in enumerate(COUPLES) if m==pid]
        mix_c = couple_mix_actual[ci_list[0]] if ci_list else 0
        total = mix_c + mens_ct.get(pid, 0)
    game_totals[pid] = total
    flag = " ← plays 4 games" if total == 4 else (" ← plays 3 (capacity ok)" if total == 3 else "")
    print(f"  {p['name']:12} {mix_c:<4} {mens_ct.get(pid,0):<6} {total:<6} ({p['gender']}){flag}")

print(f"\n  NOTE: One woman plays 3 games — unavoidable with 7 mixed slots / 3 couples.")
print(f"  NOTE: 2 men play 4 games — same structure as Hill Street Blues.")

# ── Generate XLSX ─────────────────────────────────────────────────────────────
wb = Workbook()

# ═══════════════════════════════════════════════════════════════════════════════
# Sheet 1 — Full Schedule (both teams side by side)
# ═══════════════════════════════════════════════════════════════════════════════
ws1 = wb.active
ws1.title = "Full Schedule"

# Title
ws1.merge_cells("A1:H1")
t = ws1["A1"]
t.value = "ATH Open — Full Tournament Schedule  (Hill Street Blues  vs  Blue Crew / JPL Team)"
cs(t, fill=G_DARK, bold=True, color="FFFFFF", size=12)
ws1.row_dimensions[1].height = 26

# Headers
hdrs = ["Round","Time","Court","Type","Hill Street Blues","","Blue Crew (JPL)",""]
sub   = ["","","","","Player 1","Player 2","Player 1","Player 2"]
for ci, h in enumerate(hdrs, 1):
    c = ws1.cell(row=2, column=ci, value=h)
    cs(c, fill=G_MID, bold=True, color="FFFFFF", size=9)
for ci, h in enumerate(sub, 1):
    c = ws1.cell(row=3, column=ci, value=h)
    cs(c, fill=G_DARK, bold=True, color="FFFFFF", size=8)
ws1.row_dimensions[2].height = 18
ws1.row_dimensions[3].height = 16

for r in range(1,10):
    for court in ('S','N'):
        slot = (r, court)
        a1, a2, is_mix = A_SCHED[slot]
        b1_, b2_, _ = B_SCHED[slot]
        row = 4 + (r-1)*2 + (0 if court=='S' else 1)
        fill = YELLOW if is_mix else (RED_L if (r-1)%2==0 else WHITE)
        type_str = "Mix Doubles ★" if is_mix else "Men's Doubles"
        court_str = f"{court} ({'South' if court=='S' else 'North'})"
        vals = [r, TIMES[r], court_str, type_str, a1, a2, b1_, b2_]
        for ci, val in enumerate(vals, 1):
            c = ws1.cell(row=row, column=ci, value=val)
            c.fill = YELLOW if is_mix else WHITE
            c.font = Font(bold=is_mix, size=10)
            c.alignment = Alignment(horizontal="center" if ci not in (5,6,7,8) else "left",
                                    vertical="center")
            c.border = border
        ws1.row_dimensions[row].height = 18

widths = [7,10,14,16,14,14,14,14]
for i, w in enumerate(widths, 1):
    ws1.column_dimensions[get_column_letter(i)].width = w
ws1.freeze_panes = "A4"

# ═══════════════════════════════════════════════════════════════════════════════
# Sheet 2 — Blue Crew Pairings Matrix
# ═══════════════════════════════════════════════════════════════════════════════
ws2 = wb.create_sheet("Blue Crew Matrix")

b_names_ordered = (
    [nm(pid) for pid,p in PB.items() if p['gender']=='F'] +
    [nm(pid) for pid,p in PB.items() if p['gender']=='M']
)
b_gender = {nm(pid): p['gender'] for pid,p in PB.items()}

n = len(b_names_ordered)
START_COL = 3
HEADER_ROW = 4
GAMES_COL = START_COL + n
MIX_COL   = START_COL + n + 1

# Title
ws2.merge_cells(f"A1:{get_column_letter(MIX_COL+1)}1")
t2 = ws2["A1"]
t2.value = "Blue Crew (JPL Team) — Pairings Matrix   (X = Men's Doubles  |  M★ = Mixed Doubles)"
cs(t2, fill=G_DARK, bold=True, color="FFFFFF", size=11)
ws2.row_dimensions[1].height = 22

ws2.merge_cells(f"A2:{get_column_letter(MIX_COL+1)}2")
leg2 = ws2["A2"]
leg2.value = "Couples: Trevor ↔ Alexis  ·  Marv ↔ Carmela  ·  Pierre ↔ Ivy    |    Pairings randomised (no skill ranking)"
cs(leg2, fill=G_MID, bold=False, color="FFFFFF", size=9)
ws2.row_dimensions[2].height = 16
ws2.row_dimensions[3].height = 6

# Corner labels
for col, label in [(1,"Rank"),(2,"Player")]:
    c = ws2.cell(row=HEADER_ROW, column=col, value=label)
    cs(c, fill=G_DARK, bold=True, color="FFFFFF", size=9)

# Column headers
for ci, pname in enumerate(b_names_ordered):
    col = START_COL + ci
    gender = b_gender[pname]
    label = f"{pname}\n({'F★' if gender=='F' else 'M'})"
    c = ws2.cell(row=HEADER_ROW, column=col, value=label)
    c.fill = RED_L if gender == 'F' else BLUE_L
    c.font = Font(bold=True, size=8)
    c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    c.border = border
    ws2.column_dimensions[get_column_letter(col)].width = 7

for col, label in [(GAMES_COL,"Games"),(MIX_COL,"Mix★")]:
    c = ws2.cell(row=HEADER_ROW, column=col, value=label)
    cs(c, fill=G_DARK, bold=True, color="FFFFFF", size=9)
ws2.row_dimensions[HEADER_ROW].height = 36

# Data rows
for ri, pname in enumerate(b_names_ordered):
    row = HEADER_ROW + 1 + ri
    gender = b_gender[pname]
    row_fill = RED_L if gender == 'F' else BLUE_L

    # Rank
    cs(ws2.cell(row=row, column=1, value=ri+1), fill=row_fill, bold=True, size=9)

    # Name
    pid = next(k for k,v in PB.items() if v['name']==pname)
    label = f"{pname} ({'F' if gender=='F' else 'M'})"
    cs(ws2.cell(row=row, column=2, value=label), fill=row_fill, bold=True, align="left", size=9)

    # Matrix cells
    for ci, oname in enumerate(b_names_ordered):
        col = START_COL + ci
        c = ws2.cell(row=row, column=col)
        if pname == oname:
            c.fill = GREY; c.border = border
        elif (pname, oname) in pair_map_b:
            rnd, mix = pair_map_b[(pname, oname)]
            c.value = f"M★\n{rnd}" if mix else f"X\n{rnd}"
            c.fill = YELLOW if mix else G_LIGHT
            c.font = Font(bold=True, size=8, color=("7B4F00" if mix else "1B5E20"))
            c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            c.border = border
        else:
            c.fill = WHITE; c.border = border

    # Totals
    total = game_totals[pid]
    mix_c = sum(1 for (p1,p2,rnd,mix) in b_partnerships if mix and (p1==pname or p2==pname))
    total_fill = ORANGE_L if total == 4 else row_fill
    cs(ws2.cell(row=row, column=GAMES_COL, value=total), fill=total_fill, bold=True, size=10)
    cs(ws2.cell(row=row, column=MIX_COL, value=mix_c if mix_c else "—"),
       fill=YELLOW if mix_c else row_fill, bold=bool(mix_c), size=10)

    ws2.row_dimensions[row].height = 24

ws2.column_dimensions["A"].width = 6
ws2.column_dimensions["B"].width = 14
ws2.freeze_panes = f"C{HEADER_ROW+1}"

# ═══════════════════════════════════════════════════════════════════════════════
# Sheet 3 — Player Summary
# ═══════════════════════════════════════════════════════════════════════════════
ws3 = wb.create_sheet("Player Summary")
sum_hdrs = ["Rank","Player","Gender","Couple Partner","Total Games","Men's Doubles","Mixed★","All Partners (round)"]
for ci, h in enumerate(sum_hdrs, 1):
    c = ws3.cell(row=1, column=ci, value=h)
    cs(c, fill=G_DARK, bold=True, color="FFFFFF", size=10)
ws3.row_dimensions[1].height = 22

for ri, pid in enumerate(b_players_ordered, 2):
    p = PB[pid]
    pname = p['name']
    gender = p['gender']
    partner_pid = p['partner']
    partner_name = PB[partner_pid]['name'] if partner_pid else "—"
    total = game_totals[pid]
    mix_c = sum(1 for (p1,p2,rnd,mix) in b_partnerships if mix and (p1==pname or p2==pname))
    mens_c = total - mix_c
    partner_list = []
    for (p1, p2, rnd, is_mix) in b_partnerships:
        if p1 == pname:
            partner_list.append(f"{p2} ({rnd}{'★' if is_mix else ''})")
        elif p2 == pname:
            partner_list.append(f"{p1} ({rnd}{'★' if is_mix else ''})")
    row_fill = RED_L if gender == 'F' else (ORANGE_L if total == 4 else BLUE_L)
    vals = [ri-1, pname, gender, partner_name, total, mens_c, mix_c if mix_c else 0, ",  ".join(partner_list)]
    for ci, val in enumerate(vals, 1):
        c = ws3.cell(row=ri, column=ci, value=val)
        c.fill = row_fill
        c.font = Font(bold=(ci in (2,5)), size=10)
        c.alignment = Alignment(horizontal="center" if ci != 8 else "left",
                                vertical="center", wrap_text=(ci==8))
        c.border = border
    ws3.row_dimensions[ri].height = 18

ws3.column_dimensions["A"].width = 6
ws3.column_dimensions["B"].width = 12
ws3.column_dimensions["C"].width = 8
ws3.column_dimensions["D"].width = 14
ws3.column_dimensions["E"].width = 12
ws3.column_dimensions["F"].width = 14
ws3.column_dimensions["G"].width = 10
ws3.column_dimensions["H"].width = 72
ws3.freeze_panes = "A2"

wb.save("docs/BlueCrew_Pairings.xlsx")
print(f"\n  Saved → docs/BlueCrew_Pairings.xlsx")
print(f"{'='*60}\n")
