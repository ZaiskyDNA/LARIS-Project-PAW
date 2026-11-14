import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { gabungKelas } from '../../utilitas/gabungKelas.js'

const LEBAR = { kecil: 'sm:max-w-sm', sedang: 'sm:max-w-lg', besar: 'sm:max-w-2xl' }

// Dialog di desktop, lembar bawah (bottom sheet) di HP — mengikuti desain Figma
export default function Modal({ buka, saatTutup, judul, subjudul, lebar = 'sedang', terkunci = false, children }) {
  const idJudul = useId()
  const refPanel = useRef(null)
  const refTutup = useRef(saatTutup)

  useEffect(() => {
    refTutup.current = saatTutup
  }, [saatTutup])

  useEffect(() => {
    if (!buka) return undefined
    const fokusSebelumnya = document.activeElement
    const tanganiTombol = (peristiwa) => {
      if (peristiwa.key === 'Escape' && !terkunci) refTutup.current?.()
    }
    document.addEventListener('keydown', tanganiTombol)
    document.body.style.overflow = 'hidden'
    refPanel.current?.focus()
    return () => {
      document.removeEventListener('keydown', tanganiTombol)
      document.body.style.overflow = ''
      fokusSebelumnya?.focus?.()
    }
  }, [buka, terkunci])

  if (!buka) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-tinta/55"
        aria-hidden="true"
        onClick={() => !terkunci && saatTutup?.()}
      />
      <div
        ref={refPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        tabIndex={-1}
        className={gabungKelas(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-latar shadow-2xl outline-none',
          'animate-naik rounded-t-[28px] sm:animate-muncul sm:rounded-[28px]',
          LEBAR[lebar],
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-14 shrink-0 rounded-full bg-kuning-tua sm:hidden" aria-hidden="true" />
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5 sm:px-8 sm:pt-7">
          <div className="min-w-0">
            <h2 id={idJudul} className="text-2xl font-extrabold tracking-tight text-tinta">
              {judul}
            </h2>
            {subjudul && <p className="mt-1 text-sm font-bold text-tinta">{subjudul}</p>}
          </div>
          <button
            type="button"
            onClick={saatTutup}
            disabled={terkunci}
            aria-label="Tutup"
            className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-tinta transition-colors hover:bg-kuning disabled:opacity-40"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>
        <div className="aman-bawah overflow-y-auto px-6 pt-4 sm:px-8 sm:pb-8">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
