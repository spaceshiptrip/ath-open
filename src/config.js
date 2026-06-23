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
    A: { id: 'A', name: 'CalTech',  captain: 'Suzan', color: 'red'  },
    B: { id: 'B', name: 'JPL',      captain: 'Cora',  color: 'blue' },
  },
  roundTimes: {
    1: '8:30 AM',
    2: '8:50 AM',
    3: '9:15 AM',
    4: '9:40 AM',
    5: '10:10 AM',
    6: '10:30 AM',
    7: '11:00 AM',
    8: '11:30 AM',
    9: '—',
  },
}

export const RULES = [
  'Warm-up: 8:00 AM | Match time: 8:30 AM – Noon',
  'Coin/paddle toss to determine 1st server of each game.',
  'Play 11 points per game, win by 2 points.',
  "At 11-all, the next point is game point — Receivers' Choice.",
  'REPORT WIN ONLY to your captain.',
  '18 games total: 11 Men\'s Doubles + 7 Mixed Doubles games (9 rounds × 2 courts).',
  'Each man plays 3 games (some play 4), each with a different partner.',
  '3 women play 2 games each; captain plays 1 game.',
  'Mixed Doubles (★) in rounds 4, 5 (South only), 7, and 9.',
  'Couples always play together in Mixed Doubles.',
]
