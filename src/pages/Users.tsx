import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, ChevronDown, Eye, Ban, Trash2, Users as UsersIcon } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { listUsers, suspendUser, deleteUser } from "../api/endpoints/users"
import { Badge } from "../components/ui/Badge"
import { Spinner } from "../components/ui/Spinner"
import { ConfirmModal } from "../components/ui/ConfirmModal"
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
} from "../components/ui/Skeleton"
import {
  formatDate,
  getInitials,
  getRoleBadgeVariant,
  getStatusBadgeVariant,
} from "../utils/helpers"
import type { User } from "../types"
import type { ApiError } from "../types"

const PAGE_SIZE = 15

type RoleFilter = "all" | "parent" | "babysitter"
type StatusFilter = "all" | "active" | "suspended" | "deleted"

interface ModalState {
  type: "suspend" | "delete"
  user: User
}

export const Users = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [modal, setModal] = useState<ModalState | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: listUsers,
  })

  // Client-side filtering
  const filtered = users.filter((u) => {
    const matchesSearch =
      search === "" ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, roleFilter, statusFilter])

  // Infinite scroll via IntersectionObserver
  const handleSentinel = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleCount((prev) => prev + PAGE_SIZE)
      }
    },
    [hasMore]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleSentinel, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleSentinel])

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setModal(null)
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error((error.response.data as ApiError).error || "Failed to suspend user")
      } else {
        toast.error("Failed to suspend user")
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      setModal(null)
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error((error.response.data as ApiError).error || "Failed to delete user")
      } else {
        toast.error("Failed to delete user")
      }
    },
  })

  const handleConfirm = () => {
    if (!modal) return
    if (modal.type === "suspend") {
      suspendMutation.mutate(modal.user.id)
    } else {
      deleteMutation.mutate(modal.user.id)
    }
  }

  const isMutating = suspendMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-5">
      {/* Search & Filters */}
      {isLoading ? (
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : (
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
          >
            <option value="all">All Roles</option>
            <option value="parent">Parents</option>
            <option value="babysitter">Babysitters</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-3"><SkeletonBadge /></td>
                    <td className="px-5 py-3"><SkeletonBadge /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <SkeletonButton />
                        <SkeletonButton />
                        <SkeletonButton />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? null : (
                visible.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onView={() => navigate(`/users/${user.id}`)}
                    onSuspend={() => setModal({ type: "suspend", user })}
                    onDelete={() => setModal({ type: "delete", user })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 dark:text-zinc-500">
            <UsersIcon className="h-10 w-10 opacity-40" />
            <p className="text-sm">No users found matching your search.</p>
          </div>
        )}
        {!isLoading && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {hasMore && <Spinner size="sm" />}
          </div>
        )}
      </div>

      {/* Confirm Modals */}
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
        isOpen={modal?.type === "delete"}
        title="Delete User"
        message={
          modal
            ? `Are you sure you want to delete ${modal.user.full_name}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
        isLoading={isMutating}
      />
    </div>
  )
}

interface UserRowProps {
  user: User
  onView: () => void
  onSuspend: () => void
  onDelete: () => void
}

const UserRow = ({ user, onView, onSuspend, onDelete }: UserRowProps) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors dark:hover:bg-zinc-800">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
            {getInitials(user.full_name)}
          </div>
          <span className="font-medium text-slate-800 dark:text-zinc-100">{user.full_name}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{user.email}</td>
      <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{user.phone}</td>
      <td className="px-5 py-3">
        <Badge label={user.role} variant={getRoleBadgeVariant(user.role)} />
      </td>
      <td className="px-5 py-3">
        <Badge label={user.status} variant={getStatusBadgeVariant(user.status)} />
      </td>
      <td className="px-5 py-3 text-slate-500 dark:text-zinc-500">{formatDate(user.created_at)}</td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onView}
            title="View"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          {user.status === "active" && (
            <button
              onClick={onSuspend}
              title="Suspend"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            title="Delete"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
