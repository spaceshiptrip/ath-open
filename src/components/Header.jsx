import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import athOpenBanner from '../assets/AthOpen_banner.png'

const NAV = [
  { to: '/',         label: 'Home'     },
  { to: '/register', label: 'Register' },
  { to: '/teams',    label: 'Teams'    },
  { to: '/schedule', label: 'Schedule' },
  { to: '/scores',   label: 'Scores'   },
  { to: '/rules',    label: 'Rules'    },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-pickle-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Banner logo */}
          <NavLink to="/" className="flex items-center group">
            <div className="bg-white rounded-lg px-2 py-1 shadow-md group-hover:shadow-lg transition-shadow">
              <img src={athOpenBanner} alt="The Ath Open" className="h-9 w-auto max-w-[180px] object-contain" />
            </div>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pickle-700 text-ball'
                      : 'text-gray-300 hover:text-white hover:bg-pickle-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-pickle-800 text-lg"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-pickle-700 bg-pickle-800 px-4 py-3 space-y-1">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-pickle-700 text-ball'
                    : 'text-gray-300 hover:text-white hover:bg-pickle-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
