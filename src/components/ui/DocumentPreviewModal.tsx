import { X } from "lucide-react"

interface DocumentPreviewModalProps {
  isOpen: boolean
  url: string
  title: string
  onClose: () => void
  isPdf?: boolean
}

export const DocumentPreviewModal = ({
  isOpen,
  url,
  title,
  onClose,
  isPdf: isPdfProp,
}: DocumentPreviewModalProps) => {
  if (!isOpen) return null

  const isPdf = isPdfProp ?? url.toLowerCase().endsWith(".pdf")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-[90vw] flex-col rounded-xl bg-white overflow-hidden shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {isPdf ? (
            <iframe
              src={url}
              title={title}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 p-4 dark:bg-zinc-800">
              <img
                src={url}
                alt={title}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
