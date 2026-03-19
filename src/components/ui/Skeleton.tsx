// ─── Base ─────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded dark:bg-zinc-700 ${className}`} />
)

// ─── SkeletonText ─────────────────────────────────────────────────────────────

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 1, className = "" }: SkeletonTextProps) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 mb-2 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
      />
    ))}
  </div>
)

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

interface SkeletonCardProps {
  className?: string
}

export const SkeletonCard = ({ className = "" }: SkeletonCardProps) => (
  <div
    className={`bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm ${className}`}
  >
    <div className="flex items-center gap-3 mb-3">
      <SkeletonAvatar size="sm" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-8 w-16 mt-3" />
  </div>
)

// ─── SkeletonTableRow ─────────────────────────────────────────────────────────

const colWidths: Record<number, string> = {
  0: "w-32",
  1: "w-40",
  2: "w-24",
  3: "w-16",
  4: "w-20",
}

interface SkeletonTableRowProps {
  columns?: number
}

export const SkeletonTableRow = ({ columns = 5 }: SkeletonTableRowProps) => (
  <tr className="border-b border-gray-100 dark:border-zinc-800">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-5 py-3">
        <Skeleton className={`h-4 ${colWidths[i] ?? "w-20"}`} />
      </td>
    ))}
  </tr>
)

// ─── SkeletonAvatar ───────────────────────────────────────────────────────────

const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
}

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg"
}

export const SkeletonAvatar = ({ size = "md" }: SkeletonAvatarProps) => (
  <Skeleton className={`${avatarSizes[size]} rounded-full flex-shrink-0`} />
)

// ─── SkeletonBadge ────────────────────────────────────────────────────────────

export const SkeletonBadge = () => <Skeleton className="h-5 w-16 rounded-full" />

// ─── SkeletonButton ───────────────────────────────────────────────────────────

export const SkeletonButton = () => <Skeleton className="h-9 w-24 rounded-lg" />
