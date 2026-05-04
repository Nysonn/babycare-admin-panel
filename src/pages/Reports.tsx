import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Flag, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { listReports, updateReportStatus } from "../api/endpoints/reports"
import { Badge } from "../components/ui/Badge"
import { ConfirmModal } from "../components/ui/ConfirmModal"
import {
  SkeletonTableRow,
} from "../components/ui/Skeleton"
import { formatDate } from "../utils/helpers"
import type { Report, ApiError } from "../types"

type StatusFilter = "all" | "pending" | "resolved" | "dismissed"
type ResolveAction = "resolved" | "dismissed"

interface ActionState {
  report: Report
  action: ResolveAction
}

const reportTypeBadge = (
  type: string
): "danger" | "warning" | "info" | "default" => {
  switch (type) {
    case "spam":        return "warning"
    case "harassment":  return "danger"
    case "inappropriate": return "danger"
    default:            return "default"
  }
}

const statusBadge = (
  status: string
): "warning" | "success" | "default" => {
  switch (status) {
    case "pending":   return "warning"
    case "resolved":  return "success"
    default:          return "default"
  }
}

export const Reports = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [actionState, setActionState] = useState<ActionState | null>(null)

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin", "reports", statusFilter],
    queryFn: () => listReports(statusFilter === "all" ? undefined : statusFilter),
  })

  const handleApiError = useCallback((error: unknown, fallback: string) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      toast.error((error.response.data as ApiError).error || fallback)
    } else {
      toast.error(fallback)
    }
  }, [])

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ResolveAction }) =>
      updateReportStatus(id, status),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] })
      setActionState(null)
    },
    onError: (e) => handleApiError(e, "Failed to update report"),
  })

  const handleConfirm = () => {
    if (!actionState) return
    updateMutation.mutate({ id: actionState.report.id, status: actionState.action })
  }

  const filterButtons: { label: string; value: StatusFilter; icon: React.ElementType }[] = [
    { label: "All",       value: "all",       icon: Flag },
    { label: "Pending",   value: "pending",   icon: Clock },
    { label: "Resolved",  value: "resolved",  icon: CheckCircle2 },
    { label: "Dismissed", value: "dismissed", icon: XCircle },
  ]

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Review reports submitted by parents and babysitters. Mark them as resolved or dismissed.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value
                ? "bg-primary-500 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Reporter</th>
              <th className="px-4 py-3 text-left">Reported User</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={7} />)
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-zinc-500">
                  <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p>No reports found.</p>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{report.reporter_name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{report.reporter_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{report.reported_name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{report.reported_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={report.report_type} variant={reportTypeBadge(report.report_type)} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-slate-600 dark:text-zinc-300">
                      {report.description ?? <span className="italic text-slate-400">—</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={report.status} variant={statusBadge(report.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActionState({ report, action: "resolved" })}
                          className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Resolve
                        </button>
                        <button
                          onClick={() => setActionState({ report, action: "dismissed" })}
                          className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          <XCircle className="h-3 w-3" />
                          Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={actionState?.action === "resolved"}
        title="Resolve Report"
        message={
          actionState
            ? `Mark the report against ${actionState.report.reported_name} as resolved?`
            : ""
        }
        confirmLabel="Resolve"
        confirmVariant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setActionState(null)}
        isLoading={updateMutation.isPending}
      />
      <ConfirmModal
        isOpen={actionState?.action === "dismissed"}
        title="Dismiss Report"
        message={
          actionState
            ? `Dismiss the report against ${actionState.report.reported_name}? No action will be taken.`
            : ""
        }
        confirmLabel="Dismiss"
        confirmVariant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setActionState(null)}
        isLoading={updateMutation.isPending}
      />
    </div>
  )
}
