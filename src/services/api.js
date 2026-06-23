import { SHEETS_API_URL } from '../config'
import { mockPlayers, mockMatches } from '../data/mockData'

const USE_MOCK = !SHEETS_API_URL

async function sheetsGet(params) {
  const url = new URL(SHEETS_API_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`)
  return res.json()
}

// All mutations go through GET (Apps Script doesn't handle CORS preflight for POST)
async function sheetsAction(params) {
  return sheetsGet(params)
}

export const api = {
  async getPlayers() {
    if (USE_MOCK) return { success: true, data: mockPlayers }
    return sheetsGet({ action: 'getPlayers' })
  },

  async registerPlayer(player) {
    if (USE_MOCK) {
      mockPlayers.push({ id: `p${Date.now()}`, ...player })
      return { success: true }
    }
    return sheetsAction({ action: 'registerPlayer', ...player })
  },

  async getMatches() {
    if (USE_MOCK) return { success: true, data: mockMatches }
    return sheetsGet({ action: 'getMatches' })
  },

  async updateScore({ matchId, winner, scoreA = '', scoreB = '' }) {
    if (USE_MOCK) {
      const match = mockMatches.find(m => m.id === matchId)
      if (match) { match.winner = winner; match.scoreA = scoreA; match.scoreB = scoreB }
      return { success: true }
    }
    return sheetsAction({ action: 'updateScore', matchId, winner, scoreA, scoreB })
  },

  async getStandings() {
    if (USE_MOCK) {
      const wins = { A: 0, B: 0 }
      mockMatches.forEach(m => { if (m.winner) wins[m.winner]++ })
      return { success: true, data: wins }
    }
    return sheetsGet({ action: 'getStandings' })
  },
}
