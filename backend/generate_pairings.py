"""
generate_pairings.py — Generate Blue Crew (Team B / JPL Team) pairings schedule.

Run from repo root:
    .venv/bin/python3 backend/generate_pairings.py

Outputs: docs/BlueCrew_Pairings.xlsx

── HARD CONSTRAINTS (algorithm enforces all of these) ──────────────────────────
  1. Couples always play together in mixed doubles (this iteration)
  2. Mixed distribution (3,2,2): one couple draws 3 mixed games, two draw 2
  3. No couple assigned to two courts of the same round — same person can't play
     on South and North courts simultaneously
  4. No player appears on two men's doubles courts of the same round
  5. Couple men don't play men's doubles in the same round as one of their mixed
     games (they'd be on two courts at once)
  6. No man repeats a men's doubles partner across the whole schedule
  7. Pairings are randomised — no skill ranking (no DUPR)

── UNAVOIDABLE MATH ──────────────────────────────────────────────────────────
  • One woman plays 3 games (7 mixed slots ÷ 3 couples → only (3,2,2) fits)
  • 2 non-couple men play 4 games (22 men's slots - 2 couple-men slots = 20 for
    6 non-couple men → 20 ÷ 6 = 3 rem 2 → exactly 2 must play 4)

── HOW TO TWEAK ─────────────────────────────────────────────────────────────
  To change WHO gets 3 mixed games, edit the FORCED_TRIPLE constant below
  (set to 0, 1, or 2 for the index into COUPLES, or None for random).

  To pin specific men's doubles pairings, add them to PINNED_PAIRS as a list
  of (player_id, player_id) tuples. The algorithm will include them verbatim
  and fill the remaining slots randomly around them.

  To force a specific player to play 4 games (instead of random), edit
  FORCED_QUAD_MEN below (list of 0–2 player IDs from the non-couple pool).
"""

import random, sys
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ════════════════════════════════════════════════════════════════════════════════
# CONFIGURATION — edit here to tweak the schedule
# ════════════════════════════════════════════════════════════════════════════════

RANDOM_SEED = None   # Set to an integer (e.g. 42) to get a reproducible draw

# Which couple gets 3 mixed games?  0=Trevor/Alexis  1=Marv/Carmela  2=Pierre/Ivy
# Set to None for a random draw each run.
FORCED_TRIPLE = None

# Which 2 non-couple men play 4 games? e.g. ['b4','b7'] for Arman+Richard.
# Set to None for a random draw each run.
FORCED_QUAD_MEN = None   # e.g. ['b4', 'b7']

# Pin specific men's doubles pairings. Each entry is (pid1, pid2).
# The algorithm will schedule these first, then fill remaining slots randomly.
PINNED_PAIRS = []   # e.g. [('b2','b5'), ('b4','b8')]

# ════════════════════════════════════════════════════════════════════════════════
# ROSTER & SCHEDULE DATA
# ════════════════════════════════════════════════════════════════════════════════

# Hill Street Blues (Team A) — from docs/Team Round Robin Athenaeum.docx
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

# Blue Crew roster.  Key = player ID.  partner = coupled player's ID or ''.
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

# Couples in (man_id, woman_id) order — index 0/1/2 used throughout
COUPLES = [('b6','b1'), ('b3','b9'), ('b12','b10')]
COUPLE_MEN = {m for m,w in COUPLES}

# All 7 mixed doubles slots — from actual tournament schedule
MIXED_SLOTS = [(4,'S'),(4,'N'),(5,'S'),(7,'S'),(7,'N'),(9,'S'),(9,'N')]

# ════════════════════════════════════════════════════════════════════════════════
# STEP 1 — Initialise RNG
# ════════════════════════════════════════════════════════════════════════════════

if RANDOM_SEED is not None:
    random.seed(RANDOM_SEED)
else:
    random.seed()

# ════════════════════════════════════════════════════════════════════════════════
# STEP 2 — Decide which couple gets 3 mixed games
# ════════════════════════════════════════════════════════════════════════════════

if FORCED_TRIPLE is not None:
    triple_idx = FORCED_TRIPLE
else:
    triple_idx = random.randrange(3)

mix_counts = [2, 2, 2]
mix_counts[triple_idx] = 3   # one couple plays 3; the other two play 2

# ════════════════════════════════════════════════════════════════════════════════
# STEP 3 — Assign couples to mixed slots
#           Constraint: no couple on two courts of the same round
# ════════════════════════════════════════════════════════════════════════════════

def assign_couples_to_slots(mix_counts):
    """
    Backtracking: assign couples (by index) to 7 mixed slots.
    Ensures no couple is assigned to both courts of the same round.
    Returns (slot→couple_idx dict, couple_idx→count Counter) or (None,None).
    """
    tickets = []
    for ci, cnt in enumerate(mix_counts):
        tickets.extend([ci] * cnt)

    slots = list(MIXED_SLOTS)
    random.shuffle(slots)      # randomise slot order for variety

    assignment = {}
    couple_rounds = {i: set() for i in range(3)}

    def bt(s_idx, rem):
        if s_idx == len(slots):
            return True
        slot = slots[s_idx]
        r = slot[0]
        tried = set()
        candidates = list(range(len(rem)))
        random.shuffle(candidates)
        for i in candidates:
            ci = rem[i]
            if ci in tried:
                continue
            tried.add(ci)
            if r not in couple_rounds[ci]:
                couple_rounds[ci].add(r)
                assignment[slot] = ci
                new_rem = rem[:i] + rem[i+1:]
                if bt(s_idx + 1, new_rem):
                    return True
                assignment.pop(slot)
                couple_rounds[ci].discard(r)
        return False

    if bt(0, tickets):
        return assignment, Counter(assignment.values())
    return None, None

mixed_assignment = None
for _ in range(100):
    mixed_assignment, couple_mix_actual = assign_couples_to_slots(mix_counts)
    if mixed_assignment:
        break

if not mixed_assignment:
    print("ERROR: Could not assign couples to mixed slots.")
    sys.exit(1)

# Map slot → (man_id, woman_id)
mixed_sched = {slot: COUPLES[ci] for slot, ci in mixed_assignment.items()}

# For each couple man: which rounds are they playing mixed?
couple_mixed_rounds = {}  # man_pid -> set of rounds
for slot, (mid, wid) in mixed_sched.items():
    couple_mixed_rounds.setdefault(mid, set()).add(slot[0])

# ════════════════════════════════════════════════════════════════════════════════
# STEP 4 — Decide each man's men's doubles game count
# ════════════════════════════════════════════════════════════════════════════════

# Couple men: their men's count = 3 - (number of mixed games they play)
mens_ct = {}
for ci, (mid, wid) in enumerate(COUPLES):
    mens_ct[mid] = 3 - couple_mix_actual[ci]   # 0 (if 3 mixed) or 1 (if 2 mixed)

# Non-couple men: 20 slots spread across 6 men → exactly 2 play 4, 4 play 3
non_couple = [pid for pid, p in PB.items()
              if p['gender'] == 'M' and pid not in COUPLE_MEN]

if FORCED_QUAD_MEN is not None:
    extra_men = set(FORCED_QUAD_MEN)
else:
    total_mens_slots = 22 - sum(mens_ct.values())   # always 20
    extras_needed = total_mens_slots - 3 * len(non_couple)   # always 2
    extra_men = set(random.sample(non_couple, extras_needed))

for pid in non_couple:
    mens_ct[pid] = 4 if pid in extra_men else 3

# ════════════════════════════════════════════════════════════════════════════════
# STEP 5 — Generate valid men's doubles pairs (no repeat partners)
#           Uses backtracking with most-constrained-first heuristic
# ════════════════════════════════════════════════════════════════════════════════

def make_pairs(counts, pinned):
    """
    Generate a multiset of pairs from counts dict, including pinned pairs.
    No man repeats a partner.  Returns list of (pid, pid) or None.
    """
    # Reduce counts by pinned pairs
    remaining_counts = dict(counts)
    for p1, p2 in pinned:
        remaining_counts[p1] -= 1
        remaining_counts[p2] -= 1

    pool = []
    for pid, c in sorted(remaining_counts.items(), key=lambda x: -x[1]):
        if c > 0:
            pool.extend([pid] * c)

    used = {(min(p1,p2), max(p1,p2)) for p1,p2 in pinned}
    result = list(pinned)

    def bt(rem):
        if not rem:
            return True
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
                result.pop(); used.discard(key)
        return False

    return result if bt(pool) else None

pairs = None
for _ in range(50):
    pairs = make_pairs(mens_ct, PINNED_PAIRS)
    if pairs:
        break

if not pairs:
    print("ERROR: Could not generate valid men's doubles pairs.")
    sys.exit(1)

# ════════════════════════════════════════════════════════════════════════════════
# STEP 6 — Assign pairs to men's doubles slots
#           Constraints: no player in two courts of same round;
#                        couple man not in men's during his mixed round
# ════════════════════════════════════════════════════════════════════════════════

mens_slots = [(r,c) for r in range(1,10)
              for c in ('S','N') if (r,c) not in set(MIXED_SLOTS)]

def assign_pairs_to_rounds(pairs, slots, couple_mixed_rounds):
    """
    Backtracking: assign pairs to slots.
    - No player in two slots of the same round.
    - Couple men not assigned to a round where they play mixed.
    Returns slot→pair dict or None.
    """
    shuffled = list(pairs)
    random.shuffle(shuffled)

    assignment = {}
    used_per_round = {r: set() for r in range(1,10)}

    def bt(s_idx, rem_pairs):
        if s_idx == len(slots):
            return True
        slot = slots[s_idx]
        r = slot[0]
        candidates = list(range(len(rem_pairs)))
        random.shuffle(candidates)
        for i in candidates:
            p1, p2 = rem_pairs[i]
            blocked = (
                p1 in used_per_round[r] or
                p2 in used_per_round[r] or
                r in couple_mixed_rounds.get(p1, set()) or
                r in couple_mixed_rounds.get(p2, set())
            )
            if not blocked:
                used_per_round[r].add(p1); used_per_round[r].add(p2)
                assignment[slot] = (p1, p2)
                new_rem = rem_pairs[:i] + rem_pairs[i+1:]
                if bt(s_idx + 1, new_rem):
                    return True
                assignment.pop(slot)
                used_per_round[r].discard(p1); used_per_round[r].discard(p2)
        return False

    return assignment if bt(0, shuffled) else None

mens_assignment = None
for _ in range(50):
    mens_assignment = assign_pairs_to_rounds(pairs, mens_slots, couple_mixed_rounds)
    if mens_assignment:
        break

if not mens_assignment:
    print("ERROR: Could not assign pairs to rounds without conflicts.")
    sys.exit(1)

# ════════════════════════════════════════════════════════════════════════════════
# STEP 7 — Build final schedule dict and partnership index
# ════════════════════════════════════════════════════════════════════════════════

B_SCHED = {}
for slot, (p1, p2) in mens_assignment.items():
    B_SCHED[slot] = (nm(p1), nm(p2), False)
for slot, (mid, wid) in mixed_sched.items():
    B_SCHED[slot] = (nm(mid), nm(wid), True)

b_partnerships = []
for slot in sorted(B_SCHED.keys()):
    p1, p2, is_mix = B_SCHED[slot]
    b_partnerships.append((p1, p2, f"R{slot[0]}-{slot[1]}", is_mix))

pair_map_b = {}
for p1, p2, rnd, mix in b_partnerships:
    pair_map_b[(p1,p2)] = (rnd, mix)
    pair_map_b[(p2,p1)] = (rnd, mix)

b_players_ordered = (
    [pid for pid,p in PB.items() if p['gender']=='F'] +
    [pid for pid,p in PB.items() if p['gender']=='M']
)

game_totals = {}
for pid in b_players_ordered:
    p = PB[pid]
    if p['gender'] == 'F':
        mix_c = sum(1 for slot,(mid,wid) in mixed_sched.items() if wid == pid)
        game_totals[pid] = mix_c
    else:
        ci_list = [i for i,(m,w) in enumerate(COUPLES) if m==pid]
        mix_c = couple_mix_actual[ci_list[0]] if ci_list else 0
        game_totals[pid] = mix_c + mens_ct.get(pid, 0)

# ════════════════════════════════════════════════════════════════════════════════
# STEP 8 — Validation report
# ════════════════════════════════════════════════════════════════════════════════

print(f"\n{'='*64}")
print(f"  BLUE CREW (JPL Team) — Pairings Generated")
print(f"{'='*64}")

triple_couple = COUPLES[triple_idx]
print(f"\n  Triple-game couple (drew 3 mixed): "
      f"{nm(triple_couple[0])} & {nm(triple_couple[1])}")
print(f"\n  Mixed doubles assignment:")
for slot in MIXED_SLOTS:
    mid, wid = mixed_sched[slot]
    print(f"    R{slot[0]}{slot[1]}: {nm(mid)} + {nm(wid)}")

print(f"\n  {'Player':10} {'Mix':4} {'Mens':5} {'Total':6} {'Partners (round)'}")
print(f"  {'-'*62}")
for pid in b_players_ordered:
    p = PB[pid]
    pname = p['name']
    if p['gender'] == 'F':
        mix_c = sum(1 for slot,(mid,wid) in mixed_sched.items() if wid == pid)
        mns_c = 0
    else:
        ci_list = [i for i,(m,w) in enumerate(COUPLES) if m==pid]
        mix_c = couple_mix_actual[ci_list[0]] if ci_list else 0
        mns_c = mens_ct.get(pid, 0)
    total = game_totals[pid]
    partner_strs = []
    for p1n, p2n, rnd, is_mix in b_partnerships:
        if p1n == pname:
            partner_strs.append(f"{p2n}@{rnd}{'★' if is_mix else ''}")
        elif p2n == pname:
            partner_strs.append(f"{p1n}@{rnd}{'★' if is_mix else ''}")
    flag = " ← 4 games!" if total == 4 else ""
    print(f"  {pname:10} {mix_c:<4} {mns_c:<5} {total:<6} {', '.join(partner_strs)}{flag}")

# Verify all constraints
errors = []
for r in range(1, 10):
    bc_players_this_round = []
    for c in ('S','N'):
        if (r,c) in B_SCHED:
            p1, p2, _ = B_SCHED[(r,c)]
            bc_players_this_round.extend([p1, p2])
    if len(bc_players_this_round) != len(set(bc_players_this_round)):
        errors.append(f"CONFLICT: R{r} — {bc_players_this_round}")

mens_partner_counts = Counter()
for p1n, p2n, rnd, is_mix in b_partnerships:
    if not is_mix:
        key = tuple(sorted([p1n, p2n]))
        mens_partner_counts[key] += 1
for key, cnt in mens_partner_counts.items():
    if cnt > 1:
        errors.append(f"REPEAT MEN'S PARTNER: {key[0]} + {key[1]} paired {cnt} times in men's doubles")

if errors:
    print(f"\n  !! VALIDATION ERRORS:")
    for e in errors:
        print(f"     {e}")
    sys.exit(1)
else:
    print(f"\n  ✓ All constraints satisfied — no conflicts, no repeated partners")

print(f"\n  (One woman plays 3 games and 2 men play 4 games — both unavoidable)")

# ════════════════════════════════════════════════════════════════════════════════
# XLSX STYLES
# ════════════════════════════════════════════════════════════════════════════════

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

# ════════════════════════════════════════════════════════════════════════════════
# SHEET 1 — Full Schedule (both teams side by side)
# ════════════════════════════════════════════════════════════════════════════════

wb = Workbook()
ws1 = wb.active
ws1.title = "Full Schedule"

ws1.merge_cells("A1:H1")
t = ws1["A1"]
t.value = "ATH Open — Full Tournament Schedule  (Hill Street Blues  vs  Blue Crew / JPL Team)"
cs(t, fill=G_DARK, bold=True, color="FFFFFF", size=12)
ws1.row_dimensions[1].height = 26

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
        type_str = "Mix Doubles ★" if is_mix else "Men's Doubles"
        court_str = f"{court} ({'South' if court=='S' else 'North'})"
        vals = [r, TIMES[r], court_str, type_str, a1, a2, b1_, b2_]
        for ci, val in enumerate(vals, 1):
            c = ws1.cell(row=row, column=ci, value=val)
            c.fill = YELLOW if is_mix else WHITE
            c.font = Font(bold=is_mix, size=10)
            c.alignment = Alignment(
                horizontal="center" if ci not in (5,6,7,8) else "left",
                vertical="center")
            c.border = border
        ws1.row_dimensions[row].height = 18

for i, w in enumerate([7,10,14,16,14,14,14,14], 1):
    ws1.column_dimensions[get_column_letter(i)].width = w
ws1.freeze_panes = "A4"

# ════════════════════════════════════════════════════════════════════════════════
# SHEET 2 — Blue Crew Pairings Matrix
# ════════════════════════════════════════════════════════════════════════════════

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

for col, label in [(1,"Rank"),(2,"Player")]:
    c = ws2.cell(row=HEADER_ROW, column=col, value=label)
    cs(c, fill=G_DARK, bold=True, color="FFFFFF", size=9)

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

for ri, pname in enumerate(b_names_ordered):
    row = HEADER_ROW + 1 + ri
    gender = b_gender[pname]
    row_fill = RED_L if gender == 'F' else BLUE_L
    cs(ws2.cell(row=row, column=1, value=ri+1), fill=row_fill, bold=True, size=9)
    pid = next(k for k,v in PB.items() if v['name']==pname)
    cs(ws2.cell(row=row, column=2, value=f"{pname} ({'F' if gender=='F' else 'M'})"),
       fill=row_fill, bold=True, align="left", size=9)
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
    total = game_totals[pid]
    mix_c = sum(1 for (p1,p2,rnd,mix) in b_partnerships if mix and (p1==pname or p2==pname))
    cs(ws2.cell(row=row, column=GAMES_COL, value=total),
       fill=ORANGE_L if total==4 else row_fill, bold=True, size=10)
    cs(ws2.cell(row=row, column=MIX_COL, value=mix_c if mix_c else "—"),
       fill=YELLOW if mix_c else row_fill, bold=bool(mix_c), size=10)
    ws2.row_dimensions[row].height = 24

ws2.column_dimensions["A"].width = 6
ws2.column_dimensions["B"].width = 14
ws2.freeze_panes = f"C{HEADER_ROW+1}"

# ════════════════════════════════════════════════════════════════════════════════
# SHEET 3 — Player Summary
# ════════════════════════════════════════════════════════════════════════════════

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
    partner_name = nm(p['partner']) if p['partner'] else "—"
    total = game_totals[pid]
    mix_c = sum(1 for (p1,p2,rnd,mix) in b_partnerships if mix and (p1==pname or p2==pname))
    mens_c = total - mix_c
    partner_list = []
    for (p1n, p2n, rnd, is_mix) in b_partnerships:
        if p1n == pname:
            partner_list.append(f"{p2n} ({rnd}{'★' if is_mix else ''})")
        elif p2n == pname:
            partner_list.append(f"{p1n} ({rnd}{'★' if is_mix else ''})")
    row_fill = RED_L if gender=='F' else (ORANGE_L if total==4 else BLUE_L)
    vals = [ri-1, pname, gender, partner_name, total, mens_c,
            mix_c if mix_c else 0, ",  ".join(partner_list)]
    for ci, val in enumerate(vals, 1):
        c = ws3.cell(row=ri, column=ci, value=val)
        c.fill = row_fill
        c.font = Font(bold=(ci in (2,5)), size=10)
        c.alignment = Alignment(
            horizontal="center" if ci != 8 else "left",
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
print(f"{'='*64}\n")
