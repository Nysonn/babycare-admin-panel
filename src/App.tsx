import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"
import store from "./store"
import { useAppSelector } from "./store"
import { AppLayout } from "./components/layout/AppLayout"
import { SessionExpiredModal } from "./components/ui/SessionExpiredModal"
import { Login } from "./pages/Login"
import { Dashboard } from "./pages/Dashboard"
import { Users } from "./pages/Users"
import { UserDetail } from "./pages/UserDetail"
import { Approvals } from "./pages/Approvals"
import { Activity } from "./pages/Activity"
import { CreateAdmin } from "./pages/CreateAdmin"
import { useToastStyles } from "./hooks/useToastStyles"
import type { ReactNode } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

const DarkModeManager = () => {
  const darkMode = useAppSelector((state) => state.ui.darkMode)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])
  return null
}

const AppRoutes = () => {
  const toastOptions = useToastStyles()
  return (
  <>
    <Toaster position="top-right" toastOptions={toastOptions} />
    <SessionExpiredModal />
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <Approvals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <Activity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-admin"
        element={
          <ProtectedRoute>
            <CreateAdmin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
  )
}

function App() {
  return (
    <Provider store={store}>
      <DarkModeManager />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  )
}

export default App
