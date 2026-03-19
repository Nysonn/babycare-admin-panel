import { useQuery } from "@tanstack/react-query"
import { Users, Heart, UserCheck, Clock } from "lucide-react"
import { listUsers, getActivityReport } from "../api/endpoints/users"
import { Badge } from "../components/ui/Badge"
import {
  SkeletonCard,
  SkeletonTableRow,
} from "../components/ui/Skeleton"
import {
  formatDateTime,
  getActivityBadgeVariant,
  getRoleBadgeVariant,
} from "../utils/helpers"
import { useAppSelector } from "../store"
import type { ActivityItem } from "../types"

interface StatCardProps {
  label: string
  count: number
  icon: React.ReactNode
}

const StatCard = ({ label, count, icon }: StatCardProps) => (
  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-zinc-900 dark:border-zinc-800">
    <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-500 dark:bg-primary-900/40 dark:text-primary-400">
      {icon}
    </div>
    <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">{label}</p>
    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-zinc-100">{count}</p>
  </div>
)

export const Dashboard = () => {
  const adminUser = useAppSelector((state) => state.auth.user)

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: listUsers,
  })

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: getActivityReport,
  })

  const totalUsers = users.length
  const babysitters = users.filter((u) => u.role === "babysitter").length
  const parents = users.filter((u) => u.role === "parent").length
  const pending = users.filter(
    (u) => u.role === "babysitter" && u.status === "active"
  ).length

  const sortedActivity = [...activity].sort(
    (a: ActivityItem, b: ActivityItem) => b.message_count - a.message_count
  )

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Welcome back{adminUser ? `, ${adminUser.full_name}` : ""}. Here is what is
          happening today.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {usersLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Total Users"
              count={totalUsers}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              label="Babysitters"
              count={babysitters}
              icon={<Heart className="h-6 w-6" />}
            />
            <StatCard
              label="Parents"
              count={parents}
              icon={<UserCheck className="h-6 w-6" />}
            />
            <StatCard
              label="Pending Approvals"
              count={pending}
              icon={<Clock className="h-6 w-6" />}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-10 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Recent Activity</h2>
        <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-zinc-400">
          Users sorted by message count
        </p>

        {activityLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={4} />
                ))}
              </tbody>
            </table>
          </div>
        ) : sortedActivity.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400 dark:text-zinc-500">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="rounded-lg bg-gray-50 text-left dark:bg-zinc-800">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Activity Level
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Messages
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedActivity.map((item, idx) => (
                  <tr
                    key={item.user_id}
                    className={`hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-zinc-800 ${
                      idx < sortedActivity.length - 1 ? "border-b border-gray-50 dark:border-zinc-800" : ""
                    }`}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-zinc-100">
                      {item.full_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-zinc-300">
                      <Badge
                        label={item.role}
                        variant={getRoleBadgeVariant(item.role)}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-zinc-300">
                      <Badge
                        label={item.activity_label}
                        variant={getActivityBadgeVariant(item.activity_label)}
                      />
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {item.message_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Last updated footer */}
        <p className="mt-4 text-right text-xs text-gray-400 dark:text-zinc-500">
          Last updated: {formatDateTime(new Date().toISOString())}
        </p>
      </div>
    </div>
  )
}
