import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Spinner } from "./Spinner"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  confirmVariant: "danger" | "warning"
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmBtnClass =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-yellow-500 hover:bg-yellow-600 text-white"

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-zinc-100">{title}</h2>
        <p className="mb-6 text-sm text-slate-600 dark:text-zinc-400">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex min-w-[100px] items-center justify-center rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${confirmBtnClass}`}
          >
            {isLoading ? <Spinner size="sm" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
