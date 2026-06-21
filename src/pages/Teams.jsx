import { useApi } from '../hooks/useApi'
import PlayerCard from '../components/PlayerCard'
import { TOURNAMENT } from '../config'

export default function Teams() {
  const { data: players, loading, error } = useApi('getPlayers')

  if (loading) return <Loading />
  if (error) return <Error msg={error} />

  const teamA = (players || []).filter(p => p.team === 'A')
  const teamB = (players || []).filter(p => p.team === 'B')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Team Rosters</h1>
      <p className="text-gray-500 text-sm mb-6">
        {(players || []).length} players registered across 2 teams
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <TeamSection team="A" players={teamA} captain={TOURNAMENT.teams.A.captain} />
        <TeamSection team="B" players={teamB} captain={TOURNAMENT.teams.B.captain} />
      </div>
    </div>
  )
}

function TeamSection({ team, players, captain }) {
  const isA = team === 'A'
  const headerBg  = isA ? 'bg-blue-600'  : 'bg-red-600'
  const countBg   = isA ? 'bg-blue-700'  : 'bg-red-700'

  const sorted = [...players].sort((a, b) => {
    if (a.isCaptain) return -1
    if (b.isCaptain) return 1
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  })

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Team header */}
      <div className={`${headerBg} text-white px-5 py-4 flex items-center justify-between`}>
        <div>
          <h2 className="font-display text-xl font-bold">Team {team}</h2>
          <p className="text-sm opacity-80">Captain: {captain}</p>
        </div>
        <span className={`${countBg} text-white text-sm font-bold px-3 py-1 rounded-full`}>
          {players.length} players
        </span>
      </div>

      {/* Players */}
      {sorted.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-400 text-sm">
          No players registered yet.
        </div>
      ) : (
        <div className="bg-white p-4 grid grid-cols-2 gap-3">
          {sorted.map(p => <PlayerCard key={p.id} player={p} />)}
        </div>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">
      Loading rosters…
    </div>
  )
}

function Error({ msg }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{msg}</div>
    </div>
  )
}
