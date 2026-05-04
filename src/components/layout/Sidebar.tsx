import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Activity,
  UserPlus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAppDispatch, useAppSelector } from "../../store"
import { clearCredentials } from "../../store/slices/authSlice"
import { setSidebarCollapsed } from "../../store/slices/uiSlice"
import { logoutAdmin } from "../../api/endpoints/auth"

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Users", path: "/users", icon: Users },
  { label: "Approvals", path: "/approvals", icon: CheckCircle },
  { label: "Activity", path: "/activity", icon: Activity },
  { label: "Reports", path: "/reports", icon: Flag },
  { label: "Create Admin", path: "/create-admin", icon: UserPlus },
]

export const Sidebar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = async () => {
    try {
      await logoutAdmin()
    } catch {
      // best effort
    }
    dispatch(clearCredentials())
    navigate("/login")
    toast.success("Logged out successfully")
  }

  const toggleCollapse = () => {
    dispatch(setSidebarCollapsed(!collapsed))
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col bg-white border-r border-gray-100 transition-all duration-300 dark:bg-zinc-900 dark:border-zinc-800 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header / toggle */}
      <div className="flex h-16 items-center border-b border-gray-100 px-3 dark:border-zinc-800">
        {!collapsed && (
          <span className="flex-1 text-xl font-bold text-primary-600 truncate dark:text-primary-400">
            BabyCare
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary-500 text-white dark:bg-primary-600"
                  : "text-gray-600 hover:bg-primary-50 hover:text-primary-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Icon className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 pt-4 pb-3 space-y-1 dark:border-zinc-800">
        {!collapsed && user && (
          <p className="truncate px-2 pb-1 text-sm font-medium text-gray-700 dark:text-zinc-300">
            {user.full_name}
          </p>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors duration-150 dark:text-zinc-500 dark:hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
