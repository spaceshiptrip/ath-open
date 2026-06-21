const TEAM_COLORS = {
  A: { bg: 'bg-red-600',   ring: 'ring-red-400',   badge: 'bg-red-100  text-red-800'   },
  B: { bg: 'bg-blue-600',  ring: 'ring-blue-400',  badge: 'bg-blue-100 text-blue-800'  },
}

export default function PlayerCard({ player, compact = false }) {
  const { firstName, lastName, team, gender, isCaptain, headshotUrl } = player
  const colors = TEAM_COLORS[team] || TEAM_COLORS.A
  const initials = `${firstName[0]}${lastName[0]}`

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Avatar initials={initials} headshotUrl={headshotUrl} size="sm" colors={colors} />
        <span className="text-sm font-medium text-gray-800">
          {firstName} {lastName}
          {isCaptain && <span className="ml-1 text-xs text-ball-dark font-semibold">(C)</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="card flex flex-col items-center text-center gap-3 p-4">
      <Avatar initials={initials} headshotUrl={headshotUrl} size="lg" colors={colors} />
      <div>
        <p className="font-semibold text-gray-900">{firstName} {lastName}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
            Team {team}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
            {gender === 'M' ? 'Men' : 'Women'}
          </span>
          {isCaptain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ball-light text-pickle-900 font-semibold">
              Captain
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Avatar({ initials, headshotUrl, size, colors }) {
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-8 h-8 text-xs'
  return headshotUrl ? (
    <img
      src={headshotUrl}
      alt={initials}
      className={`${dim} rounded-full object-cover ring-2 ${colors.ring}`}
    />
  ) : (
    <div className={`${dim} rounded-full ${colors.bg} text-white flex items-center justify-center font-bold ring-2 ${colors.ring} ring-offset-1`}>
      {initials}
    </div>
  )
}
