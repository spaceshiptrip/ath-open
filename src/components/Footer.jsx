import { TOURNAMENT } from '../config'
import athLogo from '../assets/athenaeum_header_logo.png'

export default function Footer() {
  return (
    <footer className="bg-pickle-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2.5 py-1">
              <img src={athLogo} alt="The Athenaeum" className="h-6 w-auto" />
            </div>
            <div className="leading-tight">
              <p className="text-white font-display font-semibold text-sm">{TOURNAMENT.fullName}</p>
              <p className="text-pickle-400 text-xs">{TOURNAMENT.subtitle}</p>
            </div>
          </div>
          <p className="text-xs text-pickle-500 text-center sm:text-right">
            {TOURNAMENT.date} · {TOURNAMENT.warmUp} Warm-up · {TOURNAMENT.matchTime} Matches
          </p>
        </div>
      </div>
    </footer>
  )
}
