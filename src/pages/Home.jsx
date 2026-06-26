import { Link } from 'react-router-dom'
import { TOURNAMENT, RULES } from '../config'
import { useApi } from '../hooks/useApi'
import athOpenLogo from '../assets/AthOpen_logo_transp.png'
import athCourts     from '../assets/athenaeum_pickle_courts.jpg'
import teamALogo from '../assets/hsb_red_logo.png'
import teamBLogo from '../assets/team-b-logo.jpg'

export default function Home() {
  const { data: matches } = useApi('getMatches')
  const winsA  = (matches || []).filter(m => m.winner === 'A').length
  const winsB  = (matches || []).filter(m => m.winner === 'B').length
  const played = (matches || []).filter(m => m.winner).length
  const total  = (matches || []).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* ── Hero ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl text-white text-center">
        {/* Courts photo */}
        <img
          src={athCourts}
          alt="The Athenaeum Pickleball Courts"
          className="w-full h-72 sm:h-96 object-cover object-center"
        />

        {/* Gradient overlay — darker at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-pickle-900/40 via-pickle-900/55 to-pickle-900/95" />

        {/* Floating content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6">
          {/* Logo */}
          <img
            src={athOpenLogo}
            alt="The Ath Open"
            className="w-64 sm:w-80 max-w-[88%] object-contain mb-2"
          />
          <p className="text-pickle-200 text-sm mb-0.5">Team Round Robin</p>
          <p className="text-pickle-300 text-xs">
            {TOURNAMENT.date} &nbsp;·&nbsp; Warm-up {TOURNAMENT.warmUp} &nbsp;·&nbsp; Matches {TOURNAMENT.matchTime}
          </p>
        </div>
      </div>

      {/* ── Live scoreboard ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <ScoreBox
          label={TOURNAMENT.teams.A.name}
          value={winsA}
          sub="wins"
          color="text-red-600"
          bg="bg-red-50"
          ring="ring-red-200"
        />
        <ScoreBox
          label="Games Played"
          value={`${played}/${total}`}
          sub="complete"
          color="text-pickle-700"
          bg="bg-pickle-50"
          ring="ring-pickle-200"
        />
        <ScoreBox
          label={TOURNAMENT.teams.B.name}
          value={winsB}
          sub="wins"
          color="text-blue-600"
          bg="bg-blue-50"
          ring="ring-blue-200"
        />
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn-primary text-base px-6 py-3">
          ＋ Register Player
        </Link>
        <Link to="/scores" className="btn-secondary text-base px-6 py-3">
          📊 Live Scores
        </Link>
        <Link to="/schedule" className="btn-outline text-base px-6 py-3">
          📋 Schedule
        </Link>
      </div>

      {/* ── Two-column layout: teams + rules ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Teams quick view */}
        <div className="card">
          <h2 className="section-title mb-3">Teams</h2>
          <div className="space-y-3">
            <TeamBadge team="A" name={TOURNAMENT.teams.A.name} captain={TOURNAMENT.teams.A.captain} color="red"  logo={teamALogo} />
            <TeamBadge team="B" name={TOURNAMENT.teams.B.name} captain={TOURNAMENT.teams.B.captain} color="blue" logo={teamBLogo} />
          </div>
          <Link to="/teams" className="inline-block mt-4 text-sm text-pickle-600 hover:underline font-medium">
            View full rosters →
          </Link>
        </div>

        {/* Rules summary */}
        <div className="card">
          <h2 className="section-title mb-3">Key Rules</h2>
          <ul className="space-y-2">
            {RULES.slice(1, 6).map((rule, i) => {
              const isSub = rule.startsWith('→ ')
              return (
                <li key={i} className={`flex items-start gap-2 text-sm text-gray-700 ${isSub ? 'ml-4' : ''}`}>
                  <span className={`mt-0.5 shrink-0 ${isSub ? 'text-gray-300' : 'text-pickle-400'}`}>
                    {isSub ? '◦' : '▸'}
                  </span>
                  {isSub ? rule.slice(2) : rule}
                </li>
              )
            })}
          </ul>
          <Link to="/rules" className="inline-block mt-4 text-sm text-pickle-600 hover:underline font-medium">
            All rules →
          </Link>
        </div>
      </div>

    </div>
  )
}

function ScoreBox({ label, value, sub, color, bg, ring }) {
  return (
    <div className={`${bg} ring-1 ${ring} rounded-xl py-4 px-2 text-center shadow-sm`}>
      <p className={`text-2xl sm:text-3xl font-display font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      <p className="text-xs font-semibold text-gray-600 mt-1 leading-tight">{label}</p>
    </div>
  )
}

function TeamBadge({ team, name, captain, color, logo }) {
  const isRed = color === 'red'
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${isRed ? 'bg-red-50' : 'bg-blue-50'}`}>
      {logo ? (
        <img src={logo} alt={`${name} logo`} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
      ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-white text-lg shadow-sm ${isRed ? 'bg-red-600' : 'bg-blue-600'}`}>
          {team}
        </div>
      )}
      <div>
        <p className={`font-semibold text-sm ${isRed ? 'text-red-800' : 'text-blue-800'}`}>{name}</p>
        <p className="text-xs text-gray-500">Captain: {captain}</p>
      </div>
    </div>
  )
}
