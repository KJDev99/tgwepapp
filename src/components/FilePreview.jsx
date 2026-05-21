import { useEffect, useState } from 'react'
import {
  FiX,
  FiImage,
  FiFileText,
  FiFile,
  FiVideo,
  FiMusic,
  FiArchive,
} from 'react-icons/fi'
import { fileIconType, formatBytes, isImage } from '../utils/files'

const ICONS = {
  image: FiImage,
  pdf: FiFileText,
  doc: FiFileText,
  excel: FiFileText,
  video: FiVideo,
  audio: FiMusic,
  archive: FiArchive,
  other: FiFile,
}

export default function FilePreview({ file, onRemove, size = 'sm' }) {
  const [thumb, setThumb] = useState(null)

  useEffect(() => {
    if (!isImage(file)) {
      setThumb(null)
      return
    }
    const url = URL.createObjectURL(file)
    setThumb(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const Icon = ICONS[fileIconType(file)] || FiFile
  const isLarge = size === 'lg'
  const tileSize = isLarge ? 'w-20 h-20' : 'w-14 h-14'

  return (
    <div className="shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center gap-2 relative max-w-[200px]">
      <div
        className={`${tileSize} rounded-md overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center shrink-0`}
      >
        {thumb ? (
          <img src={thumb} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <Icon size={isLarge ? 28 : 20} className="text-gray-500 dark:text-gray-400" />
        )}
      </div>
      <div className="min-w-0 pr-5">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          {formatBytes(file.size)}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-700/80 text-white flex items-center justify-center"
          aria-label="Удалить"
        >
          <FiX size={12} />
        </button>
      )}
    </div>
  )
}
