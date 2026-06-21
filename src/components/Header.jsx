import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { TOURNAMENT } from '../config'

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
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
            <span className="text-ball text-2xl leading-none">🥒</span>
            <span className="text-white">{TOURNAMENT.name}</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-pickle-700 bg-pickle-800 px-4 py-2">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium ${
                  isActive ? 'text-ball' : 'text-gray-300 hover:text-white'
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
