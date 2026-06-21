import { Link } from 'react-router-dom'
import { TOURNAMENT, RULES } from '../config'
import { useApi } from '../hooks/useApi'

export default function Home() {
  const { data: matches } = useApi('getMatches')
  const winsA = (matches || []).filter(m => m.winner === 'A').length
  const winsB = (matches || []).filter(m => m.winner === 'B').length
  const played = (matches || []).filter(m => m.winner).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

      {/* Hero */}
      <div className="relative bg-pickle-900 rounded-2xl overflow-hidden text-white text-center py-14 px-6 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_12px)]" />
        <span className="relative text-5xl mb-3 block">🥒</span>
        <h1 className="relative font-display text-4xl font-bold text-ball mb-2">
          {TOURNAMENT.fullName}
        </h1>
        <p className="relative text-lg text-pickle-200 mb-1">{TOURNAMENT.subtitle}</p>
        <p className="relative text-sm text-pickle-300">
          {TOURNAMENT.date} &nbsp;·&nbsp; {TOURNAMENT.location}
        </p>
        <p className="relative text-xs text-pickle-400 mt-1">
          Warm-up {TOURNAMENT.warmUp} &nbsp;|&nbsp; Matches {TOURNAMENT.matchTime}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Team A Wins" value={winsA} color="text-blue-600" />
        <StatBox label="Games Played" value={played} color="text-pickle-700" />
        <StatBox label="Team B Wins" value={winsB} color="text-red-600" />
      </div>

      {/* CTA buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn-primary">Register Player</Link>
        <Link to="/scores"   className="btn-secondary">Live Scores</Link>
        <Link to="/schedule" className="btn-outline">View Schedule</Link>
      </div>

      {/* Tournament at a glance */}
      <div className="card">
        <h2 className="section-title mb-3">Tournament Format</h2>
        <ul className="space-y-2">
          {RULES.slice(0, 6).map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-pickle-500 mt-0.5 shrink-0">▸</span>
              {rule}
            </li>
          ))}
        </ul>
        <Link to="/rules" className="inline-block mt-4 text-sm text-pickle-600 hover:underline font-medium">
          View all rules →
        </Link>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="card text-center py-4">
      <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
