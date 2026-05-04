import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, UserX, Ban, Archive } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { listUsers, suspendUser, archiveUser } from "../api/endpoints/users"
import { Badge } from "../components/ui/Badge"
import { ConfirmModal } from "../components/ui/ConfirmModal"
import {
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonText,
} from "../components/ui/Skeleton"
import { getInitials, formatDate, getStatusBadgeVariant } from "../utils/helpers"
import type { User } from "../types"
import type { ApiError } from "../types"

type ModalAction = "suspend" | "archive"

interface ModalState {
  type: ModalAction
  user: User
}

export const Approvals = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<ModalState | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: listUsers,
  })

  const babysitters = users.filter((u) => u.role === "babysitter")

  const filtered = babysitters.filter(
    (u) =>
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleApiError = useCallback((error: unknown, fallback: string) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      toast.error((error.response.data as ApiError).error || fallback)
    } else {
      toast.error(fallback)
    }
  }, [])

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setModal(null)
    },
    onError: (e) => handleApiError(e, "Failed to suspend user"),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveUser(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setModal(null)
    },
    onError: (e) => handleApiError(e, "Failed to archive user"),
  })

  const handleConfirm = () => {
    if (!modal) return
    if (modal.type === "suspend") suspendMutation.mutate(modal.user.id)
    else archiveMutation.mutate(modal.user.id)
  }

  const isMutating = suspendMutation.isPending || archiveMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header info */}
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Review each babysitter's documents before approving. Click "Review Profile" to
        view full details.
      </p>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search babysitters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800"
            >
              <SkeletonAvatar size="lg" />
              <SkeletonText className="w-32 mt-3" />
              <SkeletonText className="w-40 mt-1" />
              <SkeletonText className="w-28 mt-1" />
              <SkeletonBadge />
              <SkeletonText className="w-24 mt-2" />
              <div className="w-full mt-4">
                <SkeletonButton />
              </div>
              <div className="flex w-full gap-2 mt-2">
                <SkeletonButton />
                <SkeletonButton />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 shadow-sm text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
          <UserX className="h-12 w-12 opacity-40" />
          <p className="text-sm">No babysitter accounts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => (
            <BabysitterCard
              key={user.id}
              user={user}
              onReview={() => navigate(`/users/${user.id}`)}
              onSuspend={() => setModal({ type: "suspend", user })}
              onArchive={() => setModal({ type: "archive", user })}
            />
          ))}
        </div>
      )}

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={modal?.type === "suspend"}
        title="Suspend User"
        message={
          modal
            ? `Are you sure you want to suspend ${modal.user.full_name}? Their conversations will be locked immediately.`
            : ""
        }
        confirmLabel="Suspend"
        confirmVariant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        isLoading={isMutating}
      />
      <ConfirmModal
        isOpen={modal?.type === "archive"}
        title="Archive User"
        message={
          modal
            ? `Are you sure you want to archive ${modal.user.full_name}? Their account will be deactivated.`
            : ""
        }
        confirmLabel="Archive"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        isLoading={isMutating}
      />
    </div>
  )
}

// ─── BabysitterCard ───────────────────────────────────────────────────────────

interface BabysitterCardProps {
  user: User
  onReview: () => void
  onSuspend: () => void
  onArchive: () => void
}

const BabysitterCard = ({ user, onReview, onSuspend, onArchive }: BabysitterCardProps) => (
  <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm border border-slate-100 gap-4 dark:bg-zinc-900 dark:border-zinc-800">
    {/* Avatar + info */}
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
        {getInitials(user.full_name)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-800 dark:text-zinc-100">{user.full_name}</p>
        <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{user.email}</p>
        <p className="text-xs text-slate-400 dark:text-zinc-500">{user.phone}</p>
      </div>
    </div>

    {/* Badges */}
    <div className="flex items-center gap-2 flex-wrap">
      <Badge label={user.status} variant={getStatusBadgeVariant(user.status)} />
      <span className="text-xs text-slate-400 dark:text-zinc-500">Joined {formatDate(user.created_at)}</span>
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-2 mt-auto">
      <button
        onClick={onReview}
        className="w-full rounded-lg bg-primary-500 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
      >
        Review Profile
      </button>
      <div className="flex gap-2">
        {user.status === "active" && (
          <button
            onClick={onSuspend}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-yellow-300 py-1.5 text-xs font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
          >
            <Ban className="h-3.5 w-3.5" />
            Suspend
          </button>
        )}
        <button
          onClick={onArchive}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-300 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
      </div>
    </div>
  </div>
)

