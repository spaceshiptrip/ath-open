import { useApi } from '../hooks/useApi'
import { TOURNAMENT } from '../config'
import MatchCard from '../components/MatchCard'

export default function Schedule() {
  const { data: matches, loading, error } = useApi('getMatches')
  const { data: players } = useApi('getPlayers')

  if (loading) return <div className="py-16 text-center text-gray-400">Loading schedule…</div>
  if (error)   return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm max-w-2xl mx-auto mt-8">{error}</div>

  const allMatches = matches || []
  const mixCount = allMatches.filter(m => m.isMix).length
  const rounds = [...new Set(allMatches.map(m => m.round))].sort((a, b) => a - b)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Match Schedule</h1>
      <p className="text-gray-500 text-sm mb-2">
        {allMatches.length} games · {mixCount} Mixed Doubles (★) · 9 rounds
      </p>
      <p className="text-xs text-gray-400 mb-6">Scores are entered on the Scores page.</p>

      <div className="space-y-6">
        {rounds.map(round => {
          const roundMatches = allMatches.filter(m => m.round === round)
          if (!roundMatches.length) return null
          const time = TOURNAMENT.roundTimes[round]
          const hasMix = roundMatches.some(m => m.isMix)
          return (
            <div key={round}>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Round {round}
                </h2>
                {time && time !== '—' && (
                  <span className="text-xs text-gray-400 font-medium">{time}</span>
                )}
                {hasMix && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">
                    includes Mix ★
                  </span>
                )}
              </div>
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
