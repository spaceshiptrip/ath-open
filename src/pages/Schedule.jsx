import { useApi } from '../hooks/useApi'
import MatchCard from '../components/MatchCard'

const ROUNDS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function Schedule() {
  const { data: matches, loading, error } = useApi('getMatches')
  const { data: players } = useApi('getPlayers')

  if (loading) return <div className="py-16 text-center text-gray-400">Loading schedule…</div>
  if (error)   return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm max-w-2xl mx-auto mt-8">{error}</div>

  const mixCount = (matches || []).filter(m => m.isMix).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Match Schedule</h1>
      <p className="text-gray-500 text-sm mb-2">
        {(matches || []).length} games · {mixCount} Mixed Doubles (★)
      </p>
      <p className="text-xs text-gray-400 mb-6">Scores are entered on the Scores page.</p>

      <div className="space-y-6">
        {ROUNDS.map(round => {
          const roundMatches = (matches || []).filter(m => m.round === round)
          if (!roundMatches.length) return null
          return (
            <div key={round}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                Round {round}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {roundMatches.map(m => (
                  <MatchCard key={m.id} match={m} players={players || []} canEdit={false} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
