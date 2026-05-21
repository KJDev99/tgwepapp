import { useState } from 'react'
import {
  FiDownload,
  FiFile,
  FiFileText,
  FiVideo,
  FiMusic,
  FiArchive,
  FiX,
} from 'react-icons/fi'
import { absoluteMediaUrl } from '../api/endpoints'

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg']

function extOf(name) {
  if (!name) return ''
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

function urlExt(url) {
  if (!url) return ''
  try {
    const u = new URL(url, window.location.origin)
    return extOf(u.pathname)
  } catch {
    return extOf(url.split('?')[0])
  }
}

function isImageAttachment(att) {
  const ext = extOf(att?.original_name) || urlExt(att?.url)
  return IMAGE_EXT.includes(ext)
}

function iconFor(att) {
  const ext = extOf(att?.original_name) || urlExt(att?.url)
  if (ext === 'pdf') return FiFileText
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return FiFileText
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FiFileText
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return FiVideo
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return FiMusic
  if (['zip', 'rar', '7z'].includes(ext)) return FiArchive
  return FiFile
}

export default function AttachmentView({ attachment, isMine, onLoad }) {
  const [lightbox, setLightbox] = useState(false)

  if (!attachment?.url) return null

  const url = absoluteMediaUrl(attachment.url)

  if (isImageAttachment(attachment)) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block rounded-lg overflow-hidden bg-black/10 mt-1"
        >
          <img
            src={url}
            alt={attachment.original_name || 'image'}
            loading="lazy"
            onLoad={onLoad}
            className="max-w-full max-h-64 object-cover"
          />
        </button>
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightbox(false)
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
              aria-label="Закрыть"
              style={{ top: 'calc(16px + env(safe-area-inset-top))' }}
            >
              <FiX size={22} />
            </button>
            <a
              href={url}
              download={attachment.original_name}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
              aria-label="Скачать"
              style={{ top: 'calc(16px + env(safe-area-inset-top))' }}
            >
              <FiDownload size={20} />
            </a>
            <img
              src={url}
              alt={attachment.original_name || 'image'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    )
  }

  const Icon = iconFor(attachment)
  const fileColor = isMine ? 'bg-white/20 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download={attachment.original_name}
      className={`mt-1 flex items-center gap-2 px-2 py-1.5 rounded-lg ${
        isMine ? 'bg-white/10' : 'bg-black/5 dark:bg-white/5'
      }`}
    >
      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${fileColor}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{attachment.original_name || 'Файл'}</p>
        <p className={`text-[10px] ${isMine ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
          Скачать
        </p>
      </div>
    </a>
  )
}
