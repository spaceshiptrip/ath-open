export const mockPlayers = [
  // Team A — Captain: Suzan
  { id: 'a1', firstName: 'Suzan',   lastName: 'King',    team: 'A', gender: 'F', isCaptain: true,  headshotUrl: '' },
  { id: 'a2', firstName: 'Marcus',  lastName: 'Rivera',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a3', firstName: 'Derek',   lastName: 'Pham',    team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a4', firstName: 'James',   lastName: 'Okafor',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a5', firstName: 'Luis',    lastName: 'Chen',    team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a6', firstName: 'Tyler',   lastName: 'Brooks',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a7', firstName: 'Kevin',   lastName: 'Marsh',   team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'a8', firstName: 'Andre',   lastName: 'Santos',  team: 'A', gender: 'M', isCaptain: false, headshotUrl: '' },
  // Team B — Captain: Cora
  { id: 'b1', firstName: 'Cora',    lastName: 'Williams',team: 'B', gender: 'F', isCaptain: true,  headshotUrl: '' },
  { id: 'b2', firstName: 'Paul',    lastName: 'Jensen',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b3', firstName: 'Raj',     lastName: 'Patel',   team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b4', firstName: 'Tom',     lastName: 'Nguyen',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b5', firstName: 'Eric',    lastName: 'Hall',    team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b6', firstName: 'Diego',   lastName: 'Castro',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b7', firstName: 'Nathan',  lastName: 'Ford',    team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
  { id: 'b8', firstName: 'Omar',    lastName: 'Diallo',  team: 'B', gender: 'M', isCaptain: false, headshotUrl: '' },
]

// 16 matches: 8 rounds × 2 courts (S = South, N = North)
// isMix = Mixed Doubles per doc (rounds 3S, 3N, 4S, 6S, 6N)
export const mockMatches = [
  { id: 'm1',  round: 1, court: 'S', isMix: false, teamAP1: 'a2', teamAP2: 'a3', teamBP1: 'b2', teamBP2: 'b3', winner: '' },
  { id: 'm2',  round: 1, court: 'N', isMix: false, teamAP1: 'a4', teamAP2: 'a5', teamBP1: 'b4', teamBP2: 'b5', winner: '' },
  { id: 'm3',  round: 2, court: 'S', isMix: false, teamAP1: 'a6', teamAP2: 'a7', teamBP1: 'b6', teamBP2: 'b7', winner: '' },
  { id: 'm4',  round: 2, court: 'N', isMix: false, teamAP1: 'a8', teamAP2: 'a2', teamBP1: 'b8', teamBP2: 'b2', winner: '' },
  { id: 'm5',  round: 3, court: 'S', isMix: true,  teamAP1: 'a1', teamAP2: 'a3', teamBP1: 'b1', teamBP2: 'b3', winner: '' },
  { id: 'm6',  round: 3, court: 'N', isMix: true,  teamAP1: 'a4', teamAP2: 'a6', teamBP1: 'b4', teamBP2: 'b6', winner: '' },
  { id: 'm7',  round: 4, court: 'S', isMix: true,  teamAP1: 'a1', teamAP2: 'a5', teamBP1: 'b1', teamBP2: 'b5', winner: '' },
  { id: 'm8',  round: 4, court: 'N', isMix: false, teamAP1: 'a7', teamAP2: 'a8', teamBP1: 'b7', teamBP2: 'b8', winner: '' },
  { id: 'm9',  round: 5, court: 'S', isMix: false, teamAP1: 'a2', teamAP2: 'a4', teamBP1: 'b2', teamBP2: 'b4', winner: '' },
  { id: 'm10', round: 5, court: 'N', isMix: false, teamAP1: 'a3', teamAP2: 'a6', teamBP1: 'b3', teamBP2: 'b6', winner: '' },
  { id: 'm11', round: 6, court: 'S', isMix: true,  teamAP1: 'a1', teamAP2: 'a7', teamBP1: 'b1', teamBP2: 'b7', winner: '' },
  { id: 'm12', round: 6, court: 'N', isMix: true,  teamAP1: 'a5', teamAP2: 'a8', teamBP1: 'b5', teamBP2: 'b8', winner: '' },
  { id: 'm13', round: 7, court: 'S', isMix: false, teamAP1: 'a2', teamAP2: 'a7', teamBP1: 'b2', teamBP2: 'b7', winner: '' },
  { id: 'm14', round: 7, court: 'N', isMix: false, teamAP1: 'a3', teamAP2: 'a8', teamBP1: 'b3', teamBP2: 'b8', winner: '' },
  { id: 'm15', round: 8, court: 'S', isMix: false, teamAP1: 'a4', teamAP2: 'a6', teamBP1: 'b4', teamBP2: 'b6', winner: '' },
  { id: 'm16', round: 8, court: 'N', isMix: false, teamAP1: 'a5', teamAP2: 'a7', teamBP1: 'b5', teamBP2: 'b7', winner: '' },
]
