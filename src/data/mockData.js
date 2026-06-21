export const mockPlayers = [
  // Team A — Captain: Suzan (9 men + 3 women)
  // Couples: (a1 Suzan ↔ a8 Andre), (a9 Rachel ↔ a11 Ryan), (a10 Lisa ↔ a12 Brian)
  { id: 'a1',  firstName: 'Suzan',   lastName: 'King',    team: 'A', gender: 'F', isCaptain: true,  headshotUrl: '' },
  { id: 'a9',  firstName: 'Rachel',  lastName: 'Park',    team: 'A', gender: 'F', isCaptain: false, headshotUrl: '' },
  { id: 'a10', firstName: 'Lisa',    lastName: 'Torres',  team: 'A', gender: 'F', isCaptain: false, headshotUrl: '' },
  { id: 'a2',  firstName: 'Marcus',  lastName: 'Rivera',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a3',  firstName: 'Derek',   lastName: 'Pham',    team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a4',  firstName: 'James',   lastName: 'Okafor',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a5',  firstName: 'Luis',    lastName: 'Chen',    team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a6',  firstName: 'Tyler',   lastName: 'Brooks',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a7',  firstName: 'Kevin',   lastName: 'Marsh',   team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a8',  firstName: 'Andre',   lastName: 'Santos',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a11', firstName: 'Ryan',    lastName: 'Park',    team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a12', firstName: 'Brian',   lastName: 'Torres',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  // Blue Crew (Team B) — Captain: Cora (9 men + 3 women)
  // Couples: (b1 Cora ↔ b8 Omar), (b9 Sofia ↔ b11 Carlos), (b10 Maria ↔ b12 James)
  { id: 'b1',  firstName: 'Cora',    lastName: 'Williams', team: 'B', gender: 'F', isCaptain: true,  headshotUrl: '' },
  { id: 'b9',  firstName: 'Sofia',   lastName: 'Reyes',    team: 'B', gender: 'F', isCaptain: false, headshotUrl: '' },
  { id: 'b10', firstName: 'Maria',   lastName: 'Kim',      team: 'B', gender: 'F', isCaptain: false, headshotUrl: '' },
  { id: 'b2',  firstName: 'Paul',    lastName: 'Jensen',   team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b3',  firstName: 'Raj',     lastName: 'Patel',    team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b4',  firstName: 'Tom',     lastName: 'Nguyen',   team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b5',  firstName: 'Eric',    lastName: 'Hall',     team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b6',  firstName: 'Diego',   lastName: 'Castro',   team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b7',  firstName: 'Nathan',  lastName: 'Ford',     team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b8',  firstName: 'Omar',    lastName: 'Diallo',   team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b11', firstName: 'Carlos',  lastName: 'Reyes',    team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b12', firstName: 'James',   lastName: 'Kim',      team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
]

// 16 matches: 8 rounds × 2 courts (S = South, N = North)
// Mix Doubles (★): rounds 3S, 3N, 4S, 6S, 6N — pre-set couples play together
// Men's Doubles: each man plays exactly 3 games with a different partner each time
// Couples: A=(a1↔a8, a9↔a11, a10↔a12)  B=(b1↔b8, b9↔b11, b10↔b12)
export const mockMatches = [
  // Round 1 — both courts Men's Doubles
  { id: 'm1',  round: 1, court: 'S', isMix: false, teamAP1: 'a2',  teamAP2: 'a3',  teamBP1: 'b2',  teamBP2: 'b3',  winner: '' },
  { id: 'm2',  round: 1, court: 'N', isMix: false, teamAP1: 'a4',  teamAP2: 'a5',  teamBP1: 'b4',  teamBP2: 'b5',  winner: '' },
  // Round 2 — both courts Men's Doubles
  { id: 'm3',  round: 2, court: 'S', isMix: false, teamAP1: 'a6',  teamAP2: 'a7',  teamBP1: 'b6',  teamBP2: 'b7',  winner: '' },
  { id: 'm4',  round: 2, court: 'N', isMix: false, teamAP1: 'a2',  teamAP2: 'a6',  teamBP1: 'b2',  teamBP2: 'b6',  winner: '' },
  // Round 3 — both courts Mix Doubles ★ (Lisa+Brian vs Maria+James; Rachel+Ryan vs Sofia+Carlos)
  { id: 'm5',  round: 3, court: 'S', isMix: true,  teamAP1: 'a10', teamAP2: 'a12', teamBP1: 'b10', teamBP2: 'b12', winner: '' },
  { id: 'm6',  round: 3, court: 'N', isMix: true,  teamAP1: 'a9',  teamAP2: 'a11', teamBP1: 'b9',  teamBP2: 'b11', winner: '' },
  // Round 4 — South Mix Doubles ★ (Suzan+Andre vs Cora+Omar); North Men's Doubles
  { id: 'm7',  round: 4, court: 'S', isMix: true,  teamAP1: 'a1',  teamAP2: 'a8',  teamBP1: 'b1',  teamBP2: 'b8',  winner: '' },
  { id: 'm8',  round: 4, court: 'N', isMix: false, teamAP1: 'a3',  teamAP2: 'a8',  teamBP1: 'b3',  teamBP2: 'b8',  winner: '' },
  // Round 5 — both courts Men's Doubles
  { id: 'm9',  round: 5, court: 'S', isMix: false, teamAP1: 'a4',  teamAP2: 'a7',  teamBP1: 'b4',  teamBP2: 'b7',  winner: '' },
  { id: 'm10', round: 5, court: 'N', isMix: false, teamAP1: 'a5',  teamAP2: 'a11', teamBP1: 'b5',  teamBP2: 'b11', winner: '' },
  // Round 6 — both courts Mix Doubles ★ (same couples repeat)
  { id: 'm11', round: 6, court: 'S', isMix: true,  teamAP1: 'a10', teamAP2: 'a12', teamBP1: 'b10', teamBP2: 'b12', winner: '' },
  { id: 'm12', round: 6, court: 'N', isMix: true,  teamAP1: 'a9',  teamAP2: 'a11', teamBP1: 'b9',  teamBP2: 'b11', winner: '' },
  // Round 7 — both courts Men's Doubles
  { id: 'm13', round: 7, court: 'S', isMix: false, teamAP1: 'a2',  teamAP2: 'a5',  teamBP1: 'b2',  teamBP2: 'b5',  winner: '' },
  { id: 'm14', round: 7, court: 'N', isMix: false, teamAP1: 'a3',  teamAP2: 'a4',  teamBP1: 'b3',  teamBP2: 'b4',  winner: '' },
  // Round 8 — both courts Men's Doubles
  { id: 'm15', round: 8, court: 'S', isMix: false, teamAP1: 'a6',  teamAP2: 'a8',  teamBP1: 'b6',  teamBP2: 'b8',  winner: '' },
  { id: 'm16', round: 8, court: 'N', isMix: false, teamAP1: 'a7',  teamAP2: 'a12', teamBP1: 'b7',  teamBP2: 'b12', winner: '' },
]
