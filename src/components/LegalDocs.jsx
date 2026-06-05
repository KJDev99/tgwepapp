import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiExternalLink, FiCheck } from 'react-icons/fi'
import { fetchLegalDocs } from '../api/legal'
import { openLink, haptic } from '../hooks/useTelegram'

// Renders the .docx legal documents through the Microsoft Office online viewer
// so they can be read inside Telegram / any browser without a download.
function officeViewerUrl(url) {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
}

/**
 * Reusable list of legal documents (privacy policy + terms of service).
 *
 * Props:
 *  - requireOpen: when true (consent mode), tracks which docs the user opened
 *    and reports readiness via onReadyChange(true) once ALL are opened.
 *  - onReadyChange: (boolean) => void
 */
export default function LegalDocs({ requireOpen = false, onReadyChange }) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [opened, setOpened] = useState({})

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchLegalDocs()
      .then((list) => {
        setDocs(list)
        if (list.length === 0) setError('Документы временно недоступны')
      })
      .catch(() => setError('Не удалось загрузить документы'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!requireOpen || !onReadyChange) return
    const ready = docs.length > 0 && docs.every((d) => opened[d.key])
    onReadyChange(ready)
  }, [requireOpen, onReadyChange, docs, opened])

  const handleOpen = (doc) => {
    haptic('selection')
    openLink(officeViewerUrl(doc.url))
    setOpened((prev) => ({ ...prev, [doc.key]: true }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{error}</p>
        <button
          onClick={load}
          className="text-sm font-semibold text-blue-500 active:text-blue-600"
        >
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => {
        const isOpened = Boolean(opened[doc.key])
        return (
          <motion.button
            key={doc.key}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpen(doc)}
            className="w-full flex items-center gap-3 text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 active:bg-gray-100 dark:active:bg-gray-700/60 transition-colors"
          >
            <span className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FiFileText size={20} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium leading-snug">{doc.title}</span>
              <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Нажмите, чтобы открыть и прочитать
              </span>
            </span>
            {requireOpen && isOpened ? (
              <span className="shrink-0 text-green-500 flex items-center gap-1 text-xs font-medium">
                <FiCheck size={16} />
              </span>
            ) : (
              <FiExternalLink size={18} className="shrink-0 text-gray-400" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
