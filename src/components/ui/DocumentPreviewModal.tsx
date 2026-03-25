import { X, FileText, ImageOff } from "lucide-react"
import { createPortal } from "react-dom"

interface DocumentPreviewModalProps {
  isOpen: boolean
  url: string
  title: string
  onClose: () => void
}

const isPdfUrl = (url: string): boolean => {
  if (!url) return false
  const cleanUrl = url.split("?")[0].toLowerCase()
  return cleanUrl.endsWith(".pdf") || cleanUrl.includes(".pdf/")
}

const handleDownload = (url: string, title: string) => {
  const link = document.createElement("a")
  link.href = url
  link.download = title
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const DocumentPreviewModal = ({
  isOpen,
  url,
  title,
  onClose,
}: DocumentPreviewModalProps) => {
  if (!isOpen) return null

  const isPdf = isPdfUrl(url)

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-[90vw] flex-col rounded-xl bg-white overflow-hidden shadow-2xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: "400px" }}>
          {isPdf ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
              <FileText size={64} className="text-primary-500" />
              <p className="text-gray-600 dark:text-zinc-400 text-center text-sm">
                This document is a PDF file. Use the buttons below to view it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(url, "_blank")}
                  className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={() => handleDownload(url, title)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 p-4 dark:bg-zinc-800">
              <img
                src={url}
                alt={title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.nextElementSibling?.classList.remove("hidden")
                }}
              />
              <div className="hidden flex-col items-center justify-center h-full gap-4">
                <ImageOff size={48} className="text-gray-400" />
                <p className="text-gray-500 text-sm">Image could not be loaded</p>
                <button
                  onClick={() => window.open(url, "_blank")}
                  className="text-primary-500 underline text-sm"
                >
                  Open original URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
