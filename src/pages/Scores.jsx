import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { mockMatches, mockPlayers } from '../data/mockData'
import MatchCard from '../components/MatchCard'
import Standings from '../components/Standings'
import { SHEETS_API_URL } from '../config'

const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function Scores() {
  const [matches,  setMatches]  = useState([])
  const [players,  setPlayers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    Promise.all([api.getMatches(), api.getPlayers()]).then(([m, p]) => {
      setMatches(m.data ?? m)
      setPlayers(p.data ?? p)
      setLoading(false)
    })
  }, [])

  const handleSetWinner = async (matchId, winner, scoreA = '', scoreB = '') => {
    setSaving(matchId)
    try {
      await api.updateScore({ matchId, winner, scoreA, scoreB })
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, winner, scoreA, scoreB } : m)
      )
    } catch (err) {
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="py-16 text-center text-gray-400">Loading scores…</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title mb-0">Live Scores</h1>
          <p className="text-gray-500 text-sm">Wins only — per tournament rules</p>
        </div>
        <div className="flex items-center gap-3">
          {!SHEETS_API_URL && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md font-medium">
              Demo mode
            </span>
          )}
          <button
            onClick={() => setEditMode(e => !e)}
            className={editMode ? 'btn-secondary' : 'btn-outline'}
          >
            {editMode ? '✓ Done Editing' : '✏ Enter Scores'}
          </button>
        </div>
      </div>

      {/* Standings */}
      <Standings matches={matches} />

      {/* Round-by-round */}
      <div className="space-y-6">
        {ROUNDS.map(round => {
          const roundMatches = matches.filter(m => m.round === round)
          if (!roundMatches.length) return null
          return (
            <div key={round}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Round {round}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {roundMatches.map(m => (
                  <div key={m.id} className={saving === m.id ? 'opacity-60 pointer-events-none' : ''}>
                    <MatchCard
                      match={m}
                      players={players}
                      canEdit={editMode}
                      onSetWinner={handleSetWinner}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
