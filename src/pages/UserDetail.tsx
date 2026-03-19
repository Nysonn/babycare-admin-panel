import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  FileText,
  IdCard,
  ScrollText,
  Briefcase,
  CheckCircle2,
  Ban,
  Trash2,
} from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { getUser, suspendUser, deleteUser, approveBabysitter } from "../api/endpoints/users"
import { Badge } from "../components/ui/Badge"
import { ConfirmModal } from "../components/ui/ConfirmModal"
import { DocumentPreviewModal } from "../components/ui/DocumentPreviewModal"
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonText,
} from "../components/ui/Skeleton"
import {
  formatDate,
  getInitials,
  getRoleBadgeVariant,
  getStatusBadgeVariant,
} from "../utils/helpers"
import type { ApiError } from "../types"

type ActionType = "approve" | "suspend" | "delete"

interface DocPreview {
  url: string
  title: string
}

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeAction, setActiveAction] = useState<ActionType | null>(null)
  const [docPreview, setDocPreview] = useState<DocPreview | null>(null)

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    queryClient.invalidateQueries({ queryKey: ["admin", "users", id] })
  }

  const handleApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      toast.error((error.response.data as ApiError).error || fallback)
    } else {
      toast.error(fallback)
    }
  }

  const approveMutation = useMutation({
    mutationFn: () => approveBabysitter(id!),
    onSuccess: (data) => {
      toast.success(data.message)
      invalidate()
      setActiveAction(null)
    },
    onError: (e) => handleApiError(e, "Failed to approve babysitter"),
  })

  const suspendMutation = useMutation({
    mutationFn: () => suspendUser(id!),
    onSuccess: (data) => {
      toast.success(data.message)
      invalidate()
      setActiveAction(null)
    },
    onError: (e) => handleApiError(e, "Failed to suspend user"),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id!),
    onSuccess: (data) => {
      toast.success(data.message)
      invalidate()
      setActiveAction(null)
      navigate("/users")
    },
    onError: (e) => handleApiError(e, "Failed to delete user"),
  })

  const handleConfirm = () => {
    if (activeAction === "approve") approveMutation.mutate()
    else if (activeAction === "suspend") suspendMutation.mutate()
    else if (activeAction === "delete") deleteMutation.mutate()
  }

  const isMutating =
    approveMutation.isPending || suspendMutation.isPending || deleteMutation.isPending

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile header skeleton */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <SkeletonAvatar size="lg" />
              <div className="space-y-2">
                <SkeletonText className="w-48" />
                <div className="flex gap-2">
                  <SkeletonBadge />
                  <SkeletonBadge />
                </div>
                <SkeletonText className="w-32" />
                <SkeletonText className="w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <SkeletonButton />
              <SkeletonButton />
            </div>
          </div>
        </div>

        {/* Details section skeleton */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <Skeleton className="h-4 w-32 mb-6" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Documents section skeleton */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 p-4 dark:bg-zinc-800 dark:border-zinc-700">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-24 mt-3" />
                <SkeletonButton />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-zinc-400">
        Failed to load user. Please try again.
      </div>
    )
  }

  const isBabysitter = user.role === "babysitter"

  const modalConfig: Record<ActionType, { title: string; message: string; confirmLabel: string; confirmVariant: "danger" | "warning" }> = {
    approve: {
      title: "Approve Babysitter",
      message: `Approve ${user.full_name} as a verified babysitter on BabyCare? They will receive a confirmation email.`,
      confirmLabel: "Approve",
      confirmVariant: "warning",
    },
    suspend: {
      title: "Suspend User",
      message: `Are you sure you want to suspend ${user.full_name}? Their conversations will be locked immediately.`,
      confirmLabel: "Suspend",
      confirmVariant: "warning",
    },
    delete: {
      title: "Delete User",
      message: `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
    },
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors dark:text-zinc-400 dark:hover:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* Profile Header Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            {isBabysitter && user.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.full_name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary-200"
              />
            ) : (
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${
                  isBabysitter
                    ? "bg-primary-100 text-primary-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {getInitials(user.full_name)}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{user.full_name}</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{user.email}</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{user.phone}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge label={user.role} variant={getRoleBadgeVariant(user.role)} />
                <Badge label={user.status} variant={getStatusBadgeVariant(user.status)} />
                {isBabysitter && (
                  <Badge
                    label={user.is_approved ? "Approved" : "Pending Approval"}
                    variant={user.is_approved ? "success" : "warning"}
                  />
                )}
                <span className="text-xs text-slate-400 self-center dark:text-zinc-500">
                  Joined {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {isBabysitter && user.is_approved === false && (
              <button
                onClick={() => setActiveAction("approve")}
                className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
            )}
            {user.status === "active" && (
              <button
                onClick={() => setActiveAction("suspend")}
                className="flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
              >
                <Ban className="h-4 w-4" />
                Suspend
              </button>
            )}
            <button
              onClick={() => setActiveAction("delete")}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
          Profile Details
        </h3>

        {isBabysitter ? (
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <div className="space-y-4">
              <DetailRow label="Location" value={user.location} />
              <DetailRow
                label="Languages"
                value={user.languages?.join(", ")}
              />
              <DetailRow label="Payment Method" value={user.payment_method} />
            </div>
            <div className="space-y-4">
              <DetailRow
                label="Rate"
                value={
                  user.rate_amount !== undefined && user.rate_type
                    ? `${user.rate_amount.toLocaleString()} / ${user.rate_type}`
                    : undefined
                }
              />
              <DetailRow
                label="Days per Week"
                value={user.days_per_week?.toString()}
              />
              <DetailRow
                label="Hours per Day"
                value={user.hours_per_day?.toString()}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Location" value={user.location} />
            <DetailRow label="Occupation" value={user.occupation} />
            <DetailRow label="Preferred Hours" value={user.preferred_hours} />
            <DetailRow label="Member Since" value={formatDate(user.created_at)} />
          </div>
        )}
      </div>

      {/* Documents Section (babysitters only) */}
      {isBabysitter && (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
            Documents
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DocCard
              label="National ID"
              url={user.national_id_url}
              onPreview={(url) =>
                setDocPreview({ url, title: "National ID" })
              }
            />
            <DocCard
              label="LCI Letter"
              url={user.lci_letter_url}
              onPreview={(url) =>
                setDocPreview({ url, title: "LCI Letter" })
              }
            />
            <DocCard
              label="CV / Resume"
              url={user.cv_url}
              onPreview={(url) =>
                setDocPreview({ url, title: "CV / Resume" })
              }
            />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={activeAction !== null}
        title={activeAction ? modalConfig[activeAction].title : ""}
        message={activeAction ? modalConfig[activeAction].message : ""}
        confirmLabel={activeAction ? modalConfig[activeAction].confirmLabel : ""}
        confirmVariant={activeAction ? modalConfig[activeAction].confirmVariant : "danger"}
        onConfirm={handleConfirm}
        onCancel={() => setActiveAction(null)}
        isLoading={isMutating}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={docPreview !== null}
        url={docPreview?.url ?? ""}
        title={docPreview?.title ?? ""}
        onClose={() => setDocPreview(null)}
      />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">{label}</p>
    <p className="mt-0.5 text-sm text-slate-700 dark:text-zinc-200">{value ?? "—"}</p>
  </div>
)

interface DocCardProps {
  label: string
  url?: string
  onPreview: (url: string) => void
}

const docIcons: Record<string, React.ReactNode> = {
  "National ID": <IdCard className="h-6 w-6" />,
  "LCI Letter": <ScrollText className="h-6 w-6" />,
  "CV / Resume": <Briefcase className="h-6 w-6" />,
}

const DocCard = ({ label, url, onPreview }: DocCardProps) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-center dark:bg-zinc-800 dark:border-zinc-700">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-500 dark:bg-primary-900/40 dark:text-primary-400">
      {docIcons[label] ?? <FileText className="h-6 w-6" />}
    </div>
    <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">{label}</p>
    {url ? (
      <button
        onClick={() => onPreview(url)}
        className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
      >
        Preview
      </button>
    ) : (
      <span className="text-xs text-slate-400 dark:text-zinc-500">Not uploaded</span>
    )}
  </div>
)
