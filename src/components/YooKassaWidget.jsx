import { useEffect, useRef, useState } from 'react'
import { loadYooKassaWidget } from '../utils/yookassa'

const CONTAINER_ID = 'yookassa-widget-container'

// Хостит виджет оплаты YooKassa по confirmation_token.
// onSuccess вызывается при успешном завершении (success / complete),
// onFail — при неуспехе (форма остаётся открытой для повтора).
export default function YooKassaWidget({ confirmationToken, onSuccess, onFail }) {
  const [status, setStatus] = useState('loading') // loading | ready | error
  const widgetRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!confirmationToken) return
    let cancelled = false
    doneRef.current = false
    setStatus('loading')

    loadYooKassaWidget()
      .then((Widget) => {
        if (cancelled) return
        const widget = new Widget({
          confirmation_token: confirmationToken,
          error_callback: (err) => console.error('YooKassa widget error:', err),
        })
        widgetRef.current = widget

        const succeed = () => {
          if (doneRef.current) return
          doneRef.current = true
          onSuccess?.()
        }
        widget.on('success', succeed)
        widget.on('complete', succeed)
        widget.on('fail', () => onFail?.())

        widget
          .render(CONTAINER_ID)
          .then(() => {
            if (!cancelled) setStatus('ready')
          })
          .catch(() => {
            if (!cancelled) setStatus('error')
          })
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      try {
        widgetRef.current?.destroy?.()
      } catch {
        // ignore
      }
      widgetRef.current = null
    }
  }, [confirmationToken])

  return (
    <div>
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500 text-center py-6">
          Не удалось загрузить форму оплаты. Проверьте соединение и попробуйте снова.
        </p>
      )}
      <div id={CONTAINER_ID} />
    </div>
  )
}
