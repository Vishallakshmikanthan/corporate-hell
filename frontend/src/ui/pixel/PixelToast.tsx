/**
 * CORPORATE HELL™ — Pixel Toast Container.
 *
 * Top-sliding 8-bit notifications. Auto-dismiss in 4.5s.
 * Clicking a toast immediately jumps into the relevant CorpOS app.
 */
import React from 'react'
import { useUiStore, ToastMessage } from '../../state/uiStore'
import { X, ArrowRight } from 'lucide-react'

export const PixelToastContainer: React.FC = () => {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)
  const openApp = useUiStore((s) => s.openApp)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4 font-mono select-none">
      {toasts.map((toast) => {
        const severityBg = {
          alert: 'bg-[#d9453d] text-white',
          warn: 'bg-[#f2a93b] text-[#14121c]',
          celebrate: 'bg-[#b6e52d] text-[#14121c]',
          info: 'bg-[#3e6ec0] text-white',
        }[toast.severity || 'info']

        return (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.appId) {
                openApp(toast.appId)
              }
              dismissToast(toast.id)
            }}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 w-full p-2.5
              border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c]
              cursor-pointer hover:brightness-105 active:top-[1px]
              animate-slide-up
              ${severityBg}
            `}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-base shrink-0">{toast.icon || '🔔'}</span>
              <div className="flex flex-col overflow-hidden text-left">
                <span className="font-bold text-xs uppercase tracking-wide truncate">
                  {toast.title}
                </span>
                <span className="text-[11px] opacity-90 truncate">
                  {toast.description}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {toast.appId && (
                <span className="flex items-center gap-0.5 text-[9px] uppercase px-1.5 py-0.5 bg-[#14121c]/30 border border-[#14121c]/40">
                  Open <ArrowRight className="h-2.5 w-2.5" />
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  dismissToast(toast.id)
                }}
                className="p-1 hover:bg-black/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
