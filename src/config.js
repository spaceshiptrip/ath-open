export const SHEETS_API_URL = import.meta.env.VITE_SHEETS_API_URL || ''

export const TOURNAMENT = {
  name: 'ATH Open',
  fullName: 'ATH Open Pickleball Tournament',
  subtitle: 'Team Round Robin @ The Athenaeum',
  date: 'June 28th',
  warmUp: '8:00 AM',
  matchTime: '8:30 AM – Noon',
  location: 'The Athenaeum',
  teams: {
    A: { id: 'A', name: 'Team A', captain: 'Suzan', color: 'red'  },
    B: { id: 'B', name: 'Team B', captain: 'Cora',  color: 'blue' },
  },
}

export const RULES = [
  'Warm-up: 8:00 AM | Match time: 8:30 AM – Noon',
  'Coin/paddle toss to determine 1st server of each game.',
  'Play 11 points per game, win by 2 points.',
  "At 11-all, the next point is game point — Receivers' Choice.",
  'Each player will play at least 2 games, maximum 3.',
  'Captain may play 1 different pairing each game.',
  'REPORT WIN ONLY to your captain.',
  '16 games total: 27 Men\'s Doubles + 5 Mixed Doubles games.',
  'Each man plays 3 games, each with a different partner.',
  '2 women play 2 games each; captain plays 1 game.',
  'Mixed Doubles marked with * on the schedule (rounds 3, 4, 6).',
]
