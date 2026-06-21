import { useState } from 'react'
import { api } from '../services/api'

const EMPTY = {
  firstName: '', lastName: '', team: '', gender: '',
  phone: '', email: '', headshotUrl: '',
}

export default function Register() {
  const [form, setForm]     = useState(EMPTY)
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.team || !form.gender) {
      setStatus('error')
      setErrMsg('Please fill in all required fields.')
      return
    }
    setStatus('loading')
    try {
      await api.registerPlayer({ ...form, isCaptain: false })
      setStatus('success')
      setForm(EMPTY)
    } catch (err) {
      setStatus('error')
      setErrMsg(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="section-title mb-1">Player Registration</h1>
      <p className="text-gray-500 text-sm mb-6">Sign up to play in the ATH Open Pickleball Tournament.</p>

      {status === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
          ✓ Registration successful! Your captain will be in touch.
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name *" type="text" value={form.firstName} onChange={set('firstName')} placeholder="First" />
          <Field label="Last Name *"  type="text" value={form.lastName}  onChange={set('lastName')}  placeholder="Last"  />
        </div>

        {/* Team */}
        <div>
          <label className="field-label">Team *</label>
          <div className="flex gap-3 mt-1">
            <TeamBtn team="A" selected={form.team === 'A'} onClick={() => setForm(f => ({ ...f, team: 'A' }))} />
            <TeamBtn team="B" selected={form.team === 'B'} onClick={() => setForm(f => ({ ...f, team: 'B' }))} />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="field-label">Gender *</label>
          <div className="flex gap-3 mt-1">
            <GenderBtn g="M" label="Men"   selected={form.gender === 'M'} onClick={() => setForm(f => ({ ...f, gender: 'M' }))} />
            <GenderBtn g="F" label="Women" selected={form.gender === 'F'} onClick={() => setForm(f => ({ ...f, gender: 'F' }))} />
          </div>
        </div>

        {/* Contact */}
        <Field label="Phone" type="tel"   value={form.phone}    onChange={set('phone')}    placeholder="(555) 555-5555" />
        <Field label="Email" type="email" value={form.email}    onChange={set('email')}    placeholder="you@example.com" />

        {/* Headshot */}
        <Field
          label="Headshot URL (optional)"
          type="url"
          value={form.headshotUrl}
          onChange={set('headshotUrl')}
          placeholder="https://..."
          hint="Direct link to a photo (JPEG or PNG)"
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {status === 'loading' ? 'Registering…' : 'Register Now'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pickle-500 focus:border-transparent"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function TeamBtn({ team, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
        selected
          ? team === 'A'
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-red-600 border-red-600 text-white'
          : 'border-gray-200 text-gray-600 hover:border-gray-400'
      }`}
    >
      Team {team}
    </button>
  )
}

function GenderBtn({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
        selected
          ? 'bg-pickle-600 border-pickle-600 text-white'
          : 'border-gray-200 text-gray-600 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  )
}
