import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import PlayerCard from '../components/PlayerCard'
import EditPlayerModal from '../components/EditPlayerModal'
import { TOURNAMENT } from '../config'
import { api } from '../services/api'
import teamALogo from '../assets/hsb_red_logo.png'
import teamBLogo from '../assets/team-b-logo.jpg'

export default function Teams() {
  const { data: players, loading, error, reload } = useApi('getPlayers')
  const [editMode,    setEditMode]    = useState(false)
  const [editing,     setEditing]     = useState(null)

  async function handleSave(updated) {
    await api.updatePlayer(updated)
    setEditing(null)
    reload()
  }

  if (loading) return <Loading />
  if (error)   return <ErrorMsg msg={error} />

  const teamA = (players || []).filter(p => p.team === 'A')
  const teamB = (players || []).filter(p => p.team === 'B')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="section-title">Team Rosters</h1>
        <button
          onClick={() => setEditMode(m => !m)}
          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
            editMode
              ? 'bg-pickle-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {editMode ? 'Done Editing' : 'Edit Roster'}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {(players || []).length} players registered across 2 teams
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <TeamSection
          team="A" name={TOURNAMENT.teams.A.name}
          players={teamA} captain={TOURNAMENT.teams.A.captain}
          logo={teamALogo}
          editMode={editMode} onEdit={setEditing}
        />
        <TeamSection
          team="B" name={TOURNAMENT.teams.B.name}
          players={teamB} captain={TOURNAMENT.teams.B.captain}
          logo={teamBLogo}
          editMode={editMode} onEdit={setEditing}
        />
      </div>

      {editing && (
        <EditPlayerModal
          player={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function TeamSection({ team, name, players, captain, logo, editMode, onEdit }) {
  const isA     = team === 'A'
  const headerBg = isA ? 'bg-red-600' : 'bg-blue-700'
  const countBg  = isA ? 'bg-red-700' : 'bg-blue-800'

  const sorted = [...players].sort((a, b) => {
    if (a.isCaptain) return -1
    if (b.isCaptain) return 1
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  })

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className={`${headerBg} text-white px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {logo && (
            <img src={logo} alt={`Team ${team} logo`}
              className="w-12 h-12 rounded-lg object-cover shadow-md ring-2 ring-white/30" />
          )}
          <div>
            <h2 className="font-display text-xl font-bold">{name}</h2>
            <p className="text-sm opacity-80">Captain: {captain}</p>
          </div>
        </div>
        <span className={`${countBg} text-white text-sm font-bold px-3 py-1 rounded-full`}>
          {players.length} players
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-400 text-sm">
          No players registered yet.
        </div>
      ) : (
        <div className="bg-white p-4 grid grid-cols-2 gap-3">
          {sorted.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              onEdit={editMode ? onEdit : undefined}
            />
          ))}
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

function ErrorMsg({ msg }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{msg}</div>
    </div>
  )
}
