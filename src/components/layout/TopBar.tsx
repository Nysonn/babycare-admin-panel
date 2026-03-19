import { useLocation } from "react-router-dom"
import { useAppSelector } from "../../store"
import { getInitials } from "../../utils/helpers"
import { DarkModeToggle } from "../ui/DarkModeToggle"

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/users": "Users",
  "/approvals": "Approvals",
  "/activity": "Activity",
  "/create-admin": "Create Admin",
}

const getPageTitle = (pathname: string): string => {
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.startsWith("/users/")) return "User Detail"
  return "BabyCare Admin"
}

export const TopBar = () => {
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const title = getPageTitle(location.pathname)

  return (
    <header
      className="fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 dark:bg-zinc-900 dark:border-zinc-800"
      style={{ left: "var(--sidebar-width, 240px)" }}
    >
      {/* Left — current page breadcrumb */}
      <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">{title}</span>

      {/* Right — toggle + admin name + avatar */}
      <div className="flex items-center gap-2">
        <DarkModeToggle />
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-zinc-200">
              {user.full_name}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-800 dark:text-primary-200">
              {getInitials(user.full_name)}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
