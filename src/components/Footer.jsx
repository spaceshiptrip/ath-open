import spaceshipLogo from '../assets/spaceshiptrip_logo.png'
import vibemonkeyLogo from '../assets/vibemonkey.png'

export default function Footer() {
  return (
    <footer className="bg-pickle-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">

          {/* Left — Spaceshiptrip logo */}
          <img
            src={spaceshipLogo}
            alt="Spaceshiptrip"
            className="w-14 h-14 rounded-full object-cover ring-1 ring-pickle-700 shrink-0"
          />

          {/* Center — tournament credit */}
          <div className="text-center flex-1 min-w-0">
            <p className="text-white font-display font-bold text-base leading-tight">
              The Ath Open 2026
            </p>
            <p className="text-pickle-400 text-xs mt-1.5 flex items-center justify-center gap-2 flex-wrap">
              <span>Spaceshiptrip</span>
              <span className="text-pickle-700">·</span>
              <a
                href="https://github.com/spaceshiptrip/ath-open"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pickle-400 hover:text-ball transition-colors underline underline-offset-2"
              >
                GitHub
              </a>
              <span className="text-pickle-700">·</span>
              <span>Open Source</span>
            </p>
          </div>

          {/* Right — Vibe Monkey logo */}
          <div className="bg-white rounded-xl p-1 shadow-md shrink-0">
            <img
              src={vibemonkeyLogo}
              alt="Vibe Monkey"
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>

        </div>
      </div>
    </footer>
  )
}
