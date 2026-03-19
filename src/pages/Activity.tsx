import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, Activity as ActivityIcon, TrendingDown, ChevronDown, BarChart3, ExternalLink } from "lucide-react"
import { getActivityReport } from "../api/endpoints/users"
import { Badge } from "../components/ui/Badge"
import { Spinner } from "../components/ui/Spinner"
import {
  SkeletonCard,
  SkeletonTableRow,
} from "../components/ui/Skeleton"
import { getActivityBadgeVariant, getRoleBadgeVariant } from "../utils/helpers"
import type { ActivityItem } from "../types"

const PAGE_SIZE = 15
type LevelFilter = "all" | "High" | "Medium" | "Low"

export const Activity = () => {
  const navigate = useNavigate()

  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: activity = [], isLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: getActivityReport,
  })

  const sorted = [...activity].sort(
    (a: ActivityItem, b: ActivityItem) => b.message_count - a.message_count
  )

  const filtered =
    levelFilter === "all" ? sorted : sorted.filter((i) => i.activity_label === levelFilter)

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [levelFilter])

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

  const highCount = activity.filter((i) => i.activity_label === "High").length
  const mediumCount = activity.filter((i) => i.activity_label === "Medium").length
  const lowCount = activity.filter((i) => i.activity_label === "Low").length

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Message activity for all users in the last 30 days
      </p>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <ActivityStatCard
              label="High Activity Users"
              count={highCount}
              icon={<TrendingUp className="h-5 w-5" />}
              colour="green"
            />
            <ActivityStatCard
              label="Medium Activity Users"
              count={mediumCount}
              icon={<ActivityIcon className="h-5 w-5" />}
              colour="yellow"
            />
            <ActivityStatCard
              label="Low Activity Users"
              count={lowCount}
              icon={<TrendingDown className="h-5 w-5" />}
              colour="grey"
            />
          </>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
          >
            <option value="all">All Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <span className="text-sm text-slate-400 dark:text-zinc-500">
          Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} users
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Activity Level</th>
                <th className="px-5 py-3 text-right">Messages (30d)</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={5} />
                ))
              ) : filtered.length === 0 ? null : (
                visible.map((item) => (
                    <tr key={item.user_id} className="hover:bg-slate-50 transition-colors dark:hover:bg-zinc-800">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-zinc-100">
                        {item.full_name}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          label={item.role}
                          variant={getRoleBadgeVariant(item.role)}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          label={item.activity_label}
                          variant={getActivityBadgeVariant(item.activity_label)}
                        />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-700 dark:text-zinc-200">
                        {item.message_count.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => navigate(`/users/${item.user_id}`)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          View Profile
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 dark:text-zinc-500">
            <BarChart3 className="h-10 w-10 opacity-40" />
            <p className="text-sm">No activity data available.</p>
          </div>
        )}
        {!isLoading && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {hasMore && <Spinner size="sm" />}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ActivityStatCard ─────────────────────────────────────────────────────────

interface ActivityStatCardProps {
  label: string
  count: number
  icon: React.ReactNode
  colour: "green" | "yellow" | "grey"
}

const colourMap = {
  green: {
    border: "border-green-400",
    bg: "bg-green-50",
    text: "text-green-600",
    count: "text-green-700",
  },
  yellow: {
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    count: "text-yellow-700",
  },
  grey: {
    border: "border-slate-300",
    bg: "bg-slate-50",
    text: "text-slate-500",
    count: "text-slate-700",
  },
}

const ActivityStatCard = ({ label, count, icon, colour }: ActivityStatCardProps) => {
  const c = colourMap[colour]
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border-l-4 ${c.border} bg-white px-5 py-4 shadow-sm dark:bg-zinc-900`}
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
        <p className={`text-2xl font-bold ${c.count}`}>{count}</p>
      </div>
    </div>
  )
}
