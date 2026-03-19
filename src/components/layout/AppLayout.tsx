import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useAppSelector } from "../../store"

interface AppLayoutProps {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}>
          <TopBar />
        </div>
        <main className="min-h-screen pt-24 px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
