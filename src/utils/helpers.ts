export type BadgeVariant = "success" | "warning" | "danger" | "info" | "default" | "pink"

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " at")
}

export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export const getActivityBadgeVariant = (label: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    Low: "default",
    Medium: "warning",
    High: "success",
  }
  return map[label] ?? "default"
}

export const getRoleBadgeVariant = (role: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    babysitter: "pink",
    parent: "info",
    admin: "default",
  }
  return map[role] ?? "default"
}

export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    active: "success",
    suspended: "warning",
    deleted: "danger",
  }
  return map[status] ?? "default"
}
