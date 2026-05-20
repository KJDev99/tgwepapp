import { useState } from 'react'

function getInitial(name) {
  if (!name) return '?'
  const trimmed = String(name).trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

function colorFromName(name) {
  const palette = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
  ]
  if (!name) return palette[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return palette[Math.abs(hash) % palette.length]
}

export default function Avatar({ name, photoUrl, size = 32, className = '' }) {
  const [errored, setErrored] = useState(false)
  const showImage = photoUrl && !errored
  const fontSize = Math.max(10, Math.round(size * 0.4))
  const style = { width: size, height: size, fontSize }
  const bg = colorFromName(name)

  if (showImage) {
    return (
      <img
        src={photoUrl}
        alt={name || 'avatar'}
        onError={() => setErrored(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={style}
        draggable={false}
      />
    )
  }

  return (
    <div
      className={`rounded-full text-white font-semibold flex items-center justify-center shrink-0 ${bg} ${className}`}
      style={style}
    >
      {getInitial(name)}
    </div>
  )
}
