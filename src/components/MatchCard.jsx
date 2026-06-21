import { TOURNAMENT } from '../config'

export default function MatchCard({ match, players, onSetWinner, canEdit = false }) {
  const getPlayer = (id) => players?.find(p => p.id === id)
  const pairLabel = (p1Id, p2Id) => {
    const p1 = getPlayer(p1Id)
    const p2 = getPlayer(p2Id)
    if (!p1 || !p2) return '—'
    return `${p1.firstName} & ${p2.firstName}`
  }

  const teamName = (t) => TOURNAMENT.teams[t].name
  const winnerLabel = match.winner === 'A'
    ? `${teamName('A')} wins`
    : match.winner === 'B'
      ? `${teamName('B')} wins`
      : null

  return (
    <div className={`card text-sm ${match.isMix ? 'border-l-4 border-ball' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Round {match.round} · {match.court === 'S' ? 'South' : 'North'} Court
        </span>
        {match.isMix && (
          <span className="text-xs bg-ball-light text-pickle-800 font-semibold px-2 py-0.5 rounded-full">
            Mix Doubles ★
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Team A pair */}
        <div className={`text-center p-2 rounded-lg ${match.winner === 'A' ? 'bg-red-50 ring-1 ring-red-300' : 'bg-gray-50'}`}>
          <p className="text-xs text-red-600 font-semibold mb-0.5">{teamName('A')}</p>
          <p className="font-medium text-gray-900">{pairLabel(match.teamAP1, match.teamAP2)}</p>
        </div>

        <span className="text-gray-400 font-bold text-sm">vs</span>

        {/* Team B pair */}
        <div className={`text-center p-2 rounded-lg ${match.winner === 'B' ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50'}`}>
          <p className="text-xs text-blue-600 font-semibold mb-0.5">{teamName('B')}</p>
          <p className="font-medium text-gray-900">{pairLabel(match.teamBP1, match.teamBP2)}</p>
        </div>
      </div>

      {/* Result / Score entry */}
      <div className="mt-3 flex items-center justify-between">
        {winnerLabel ? (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            match.winner === 'A' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            ✓ {winnerLabel}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">No result yet</span>
        )}

        {canEdit && (
          <div className="flex gap-1">
            <button
              onClick={() => onSetWinner(match.id, 'A')}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                match.winner === 'A'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              A Wins
            </button>
            <button
              onClick={() => onSetWinner(match.id, 'B')}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                match.winner === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              B Wins
            </button>
            {match.winner && (
              <button
                onClick={() => onSetWinner(match.id, '')}
                className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200"
                title="Clear result"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
