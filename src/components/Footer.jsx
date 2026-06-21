import { TOURNAMENT } from '../config'

export default function Footer() {
  return (
    <footer className="bg-pickle-900 text-gray-400 text-sm py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-display text-white font-semibold">{TOURNAMENT.fullName}</p>
        <p>{TOURNAMENT.date} · {TOURNAMENT.location}</p>
      </div>
    </footer>
  )
}
