export const mockPlayers = [
  // Hill Street Blues (Team A) — Captain: Suzan (9 men + 3 women)
  // No fixed couples — HSB mixes women with different men each game
  { id: 'a1',  firstName: 'Suzan',   lastName: '',  team: 'A', gender: 'F', isCaptain: true,  headshotUrl: '', partnerId: '' },
  { id: 'a2',  firstName: 'Rachel',  lastName: '',  team: 'A', gender: 'F', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a3',  firstName: 'Molly',   lastName: '',  team: 'A', gender: 'F', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a4',  firstName: 'Pierre',  lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a5',  firstName: 'Jeff',    lastName: 'E', team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a6',  firstName: 'Dro',     lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a7',  firstName: 'Steve',   lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a8',  firstName: 'Mich',    lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a9',  firstName: 'Wilfred', lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a10', firstName: 'Jeff',    lastName: 'W', team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a11', firstName: 'Yu Fon',  lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  { id: 'a12', firstName: 'Johnny',  lastName: '',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: '' },
  // Blue Crew (Team B / JPL Team) — Captain: Cora (9 men + 4 women)
  // Fixed couples (play mixed together): Alexis↔Trevor, Carmela↔Marv, Ivy↔Pierre
  // Captain pair: Jay+Cora (1 mixed game, R7N); Cora plays no other games
  { id: 'b13', firstName: 'Cora',    lastName: '',  team: 'B', gender: 'F', isCaptain: true,  headshotUrl: '', partnerId: ''   },
  { id: 'b1',  firstName: 'Alexis',  lastName: '',  team: 'B', gender: 'F', isCaptain: false, headshotUrl: '', partnerId: 'b6' },
  { id: 'b9',  firstName: 'Carmela', lastName: '',  team: 'B', gender: 'F', isCaptain: false, headshotUrl: '', partnerId: 'b3' },
  { id: 'b10', firstName: 'Ivy',     lastName: '',  team: 'B', gender: 'F', isCaptain: false, headshotUrl: '', partnerId: 'b12'},
  { id: 'b2',  firstName: 'Jay',     lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b3',  firstName: 'Marv',    lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: 'b9' },
  { id: 'b4',  firstName: 'Arman',   lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b5',  firstName: 'Jon',     lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b6',  firstName: 'Trevor',  lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: 'b1' },
  { id: 'b7',  firstName: 'Richard', lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b8',  firstName: 'Rhon',    lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b11', firstName: 'Joe',     lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: ''   },
  { id: 'b12', firstName: 'Pierre',  lastName: '',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '', partnerId: 'b10'},
]

// 18 matches: 9 rounds × 2 courts (S = South, N = North)
// Mixed Doubles (★): R4S, R4N, R5S, R7S, R7N, R9S, R9N (7 slots)
// Blue Crew couples: b1(Alexis)↔b6(Trevor), b9(Carmela)↔b3(Marv), b10(Ivy)↔b12(Pierre)
// Captain pair: b2(Jay)↔b13(Cora) — R7N only; Cora plays 1 game total
// No Blue Crew player appears on two courts of the same round (validated ✓)
// No player has back-to-back games in consecutive rounds (validated ✓)
// No Blue Crew man repeats a men's doubles partner (validated ✓)
// Rhon & Joe play 4 men's games (17 slots / 5 non-mixed men → 2 play 4, 3 play 3)
export const mockMatches = [
  // Round 1 — 8:30 AM — Men's Doubles
  { id: 'm1',  round: 1, court: 'S', isMix: false, teamAP1: 'a4',  teamAP2: 'a5',  teamBP1: 'b6',  teamBP2: 'b8',  winner: '', scoreA: '', scoreB: '' },
  { id: 'm2',  round: 1, court: 'N', isMix: false, teamAP1: 'a6',  teamAP2: 'a7',  teamBP1: 'b7',  teamBP2: 'b11', winner: '', scoreA: '', scoreB: '' },
  // Round 2 — 8:50 AM — Men's Doubles
  { id: 'm3',  round: 2, court: 'S', isMix: false, teamAP1: 'a8',  teamAP2: 'a9',  teamBP1: 'b4',  teamBP2: 'b12', winner: '', scoreA: '', scoreB: '' },
  { id: 'm4',  round: 2, court: 'N', isMix: false, teamAP1: 'a10', teamAP2: 'a11', teamBP1: 'b3',  teamBP2: 'b5',  winner: '', scoreA: '', scoreB: '' },
  // Round 3 — 9:15 AM — Men's Doubles
  { id: 'm5',  round: 3, court: 'S', isMix: false, teamAP1: 'a7',  teamAP2: 'a10', teamBP1: 'b8',  teamBP2: 'b11', winner: '', scoreA: '', scoreB: '' },
  { id: 'm6',  round: 3, court: 'N', isMix: false, teamAP1: 'a6',  teamAP2: 'a12', teamBP1: 'b2',  teamBP2: 'b7',  winner: '', scoreA: '', scoreB: '' },
  // Round 4 — 9:40 AM — Mixed Doubles ★ (both courts)
  { id: 'm7',  round: 4, court: 'S', isMix: true,  teamAP1: 'a4',  teamAP2: 'a1',  teamBP1: 'b12', teamBP2: 'b10', winner: '', scoreA: '', scoreB: '' },
  { id: 'm8',  round: 4, court: 'N', isMix: true,  teamAP1: 'a5',  teamAP2: 'a2',  teamBP1: 'b3',  teamBP2: 'b9',  winner: '', scoreA: '', scoreB: '' },
  // Round 5 — 10:10 AM — Mixed South ★, Men's North
  { id: 'm9',  round: 5, court: 'S', isMix: true,  teamAP1: 'a5',  teamAP2: 'a3',  teamBP1: 'b6',  teamBP2: 'b1',  winner: '', scoreA: '', scoreB: '' },
  { id: 'm10', round: 5, court: 'N', isMix: false, teamAP1: 'a12', teamAP2: 'a9',  teamBP1: 'b2',  teamBP2: 'b8',  winner: '', scoreA: '', scoreB: '' },
  // Round 6 — 10:30 AM — Men's Doubles
  { id: 'm11', round: 6, court: 'S', isMix: false, teamAP1: 'a11', teamAP2: 'a7',  teamBP1: 'b4',  teamBP2: 'b7',  winner: '', scoreA: '', scoreB: '' },
  { id: 'm12', round: 6, court: 'N', isMix: false, teamAP1: 'a4',  teamAP2: 'a8',  teamBP1: 'b5',  teamBP2: 'b11', winner: '', scoreA: '', scoreB: '' },
  // Round 7 — 11:00 AM — Mixed Doubles ★ (both courts)
  { id: 'm13', round: 7, court: 'S', isMix: true,  teamAP1: 'a12', teamAP2: 'a2',  teamBP1: 'b2',  teamBP2: 'b13', winner: '', scoreA: '', scoreB: '' },
  { id: 'm14', round: 7, court: 'N', isMix: true,  teamAP1: 'a8',  teamAP2: 'a3',  teamBP1: 'b12', teamBP2: 'b10', winner: '', scoreA: '', scoreB: '' },
  // Round 8 — 11:30 AM — Men's Doubles
  { id: 'm15', round: 8, court: 'S', isMix: false, teamAP1: 'a10', teamAP2: 'a6',  teamBP1: 'b4',  teamBP2: 'b11', winner: '', scoreA: '', scoreB: '' },
  { id: 'm16', round: 8, court: 'N', isMix: false, teamAP1: 'a11', teamAP2: 'a5',  teamBP1: 'b5',  teamBP2: 'b8',  winner: '', scoreA: '', scoreB: '' },
  // Round 9 — Mixed Doubles ★ (both courts)
  { id: 'm17', round: 9, court: 'S', isMix: true,  teamAP1: 'a9',  teamAP2: 'a2',  teamBP1: 'b6',  teamBP2: 'b1',  winner: '', scoreA: '', scoreB: '' },
  { id: 'm18', round: 9, court: 'N', isMix: true,  teamAP1: 'a4',  teamAP2: 'a3',  teamBP1: 'b3',  teamBP2: 'b9',  winner: '', scoreA: '', scoreB: '' },
]
