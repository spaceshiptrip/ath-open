import { useState, useRef } from 'react'

export default function EditPlayerModal({ player, onSave, onClose }) {
  const [firstName, setFirstName]   = useState(player.firstName)
  const [lastName,  setLastName]    = useState(player.lastName  || '')
  const [headshot,  setHeadshot]    = useState(player.headshotUrl || '')
  const [saving,    setSaving]      = useState(false)
  const [error,     setError]       = useState(null)
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const SIZE = 80
        const canvas = document.createElement('canvas')
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width  - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)
        setHeadshot(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave({ ...player, firstName: firstName.trim(), lastName: lastName.trim(), headshotUrl: headshot })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`
  const avatarBg = player.team === 'A' ? 'bg-red-600' : 'bg-blue-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-bold text-lg text-gray-900">Edit Player</h2>

        {/* Avatar preview */}
        <div className="flex justify-center">
          {headshot ? (
            <img src={headshot} alt={initials}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-offset-2 ring-gray-200" />
          ) : (
            <div className={`w-24 h-24 rounded-full ${avatarBg} text-white flex items-center justify-center text-3xl font-bold`}>
              {initials || '?'}
            </div>
          )}
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">First Name</label>
            <input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pickle-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Last / Initial</label>
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="optional"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pickle-400"
            />
          </div>
        </div>

        {/* Headshot */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Headshot</label>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-pickle-400 hover:text-pickle-600 transition-colors text-left"
          >
            {headshot ? 'Replace photo…' : 'Upload photo…'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <p className="text-xs text-gray-400 mt-2 mb-1">or paste a public image URL</p>
          <input
            value={headshot}
            onChange={e => setHeadshot(e.target.value)}
            placeholder="https://…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pickle-400"
          />
          {headshot && (
            <button type="button" onClick={() => setHeadshot('')}
              className="text-xs text-red-500 hover:underline mt-1 block">
              Remove headshot
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 btn-secondary py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !firstName.trim()}
            className="flex-1 btn-primary py-2 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
