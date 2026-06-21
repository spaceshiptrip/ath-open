import { TOURNAMENT } from '../config'

export default function Standings({ matches = [] }) {
  const total  = matches.filter(m => m.winner).length
  const winsA  = matches.filter(m => m.winner === 'A').length
  const winsB  = matches.filter(m => m.winner === 'B').length
  const leader = winsA > winsB ? 'A' : winsB > winsA ? 'B' : null

  return (
    <div className="card">
      <h2 className="section-title mb-4">Standings</h2>
      <div className="grid grid-cols-2 gap-4">
        <TeamStat
          team="A"
          name={TOURNAMENT.teams.A.name}
          wins={winsA}
          isLeading={leader === 'A'}
        />
        <TeamStat
          team="B"
          name={TOURNAMENT.teams.B.name}
          wins={winsB}
          isLeading={leader === 'B'}
        />
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        {total} of {matches.length} games completed
      </p>
    </div>
  )
}

function TeamStat({ team, name, wins, isLeading }) {
  const isA = team === 'A'
  return (
    <div className={`rounded-xl p-4 text-center ${isA ? 'bg-red-50' : 'bg-blue-50'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isA ? 'text-red-500' : 'text-blue-500'}`}>
        {name}
      </p>
      <p className={`text-4xl font-display font-bold ${isA ? 'text-red-700' : 'text-blue-700'}`}>
        {wins}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">wins</p>
      {isLeading && (
        <span className="inline-block mt-2 text-xs bg-ball text-pickle-900 font-bold px-2 py-0.5 rounded-full">
          LEADING
        </span>
      )}
    </div>
  )
}
